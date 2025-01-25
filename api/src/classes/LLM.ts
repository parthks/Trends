import { AI_PROMPTS } from "../helpers/prompts";
import { AiAnalyzedData, ParsedTweetData, XUserInfo } from "../helpers/types";
import { runWithTools } from "@cloudflare/ai-utils";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { createGroq, GroqProvider } from "@ai-sdk/groq";
import { generateText, streamText, generateObject } from "ai";
import { z } from "zod";

export class LLM {
  private workerAIClient: CloudflareBindings["AI"];
  private openai: OpenAIProvider;
  private groq: GroqProvider;

  private GATEWAY_ID = "trends";
  private gpt4oMini;
  private gpt4o;
  constructor(binding: CloudflareBindings) {
    this.workerAIClient = binding.AI;
    const baseURL = `https://gateway.ai.cloudflare.com/v1/${binding.CLOUDFLARE_ACCOUNT_ID}/${this.GATEWAY_ID}`;
    console.log("AI baseURL", baseURL);
    this.openai = createOpenAI({
      baseURL: `${baseURL}/openai`,
      apiKey: binding.OPENAI_API_KEY,
    });
    this.gpt4oMini = this.openai("gpt-4o-mini");
    this.gpt4o = this.openai("gpt-4o");
    this.groq = createGroq({
      baseURL: `${baseURL}/groq`,
      apiKey: binding.GROQ_API_KEY,
    });
  }

  private MODEL_NAME = "@cf/meta/llama-3.3-70b-instruct-fp8-fast" as const;

  static hasResponse(output: AiTextGenerationOutput): output is {
    response: string | undefined;
    tool_calls?: {
      name: string;
      arguments: unknown;
    }[];
  } {
    return output !== null && typeof output === "object" && !output.constructor?.name?.includes("ReadableStream");
  }

  async introduce(prompt: string) {
    // const response = await this.workerAIClient.run(
    //   this.MODEL_NAME,
    //   {
    //     messages: [{ role: "user", content: prompt }],
    //   },
    //   {
    //     gateway: { id: "trends", skipCache: true },
    //   }
    // );
    const { text } = await generateText({
      model: this.gpt4oMini,
      prompt: prompt,
    });
    return text;
  }

  streamAnswerQuestion(question: string, context: string) {
    const systemPrompt = `
    You are a precise and truthful AI assistant. Your primary rules are:
    1. Only answer using information explicitly present in the provided context
    2. If the context doesn't contain sufficient information to answer the question, clearly state that
    3. Do not make assumptions or add information beyond what's in the context
    4. If only partial information is available, specify what you can and cannot answer
    5. Maintain a friendly and conversational tone
    `;

    const prompt = `
    Please answer the following question using only the information provided in the context. If you cannot answer the question completely or partially based on the given context, please explicitly state so.

    Context:
    ${context}

    Question:
    ${question}

    Remember: Only use information from the provided context. If you're unsure or the context is insufficient, say so. Add line breaks to your response to make it more readable.
    `;

    return streamText({
      model: this.gpt4oMini,
      system: systemPrompt,
      prompt: prompt,
    });
  }

  async streamAnswerFromTweets(userPromptString: string, tweets: ParsedTweetData[]) {
    const tweetsMessage = this.parseTweetsIntoMessage(tweets);
    const systemPrompt = `
    You are a helpful assistant and an expert in crafting “Trend Posts” using tweets as context.
    Your role is to provide clear, direct answers and suggestions based on the tweets.
    Do not include filler, disclaimers, or any text other than what directly helps fulfill the user’s request.
    `;

    const tweetsContext = `
    Here is the context of the tweets:
    ${tweetsMessage}
    `;

    const userPrompt = `
    ${userPromptString}
    `;

    return streamText({
      model: this.gpt4oMini,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt },
        { role: "user", content: tweetsContext },
      ],
    });
  }

  async analyzeTweet(tweet: ParsedTweetData, userInfo: XUserInfo): Promise<AiAnalyzedData> {
    const systemPrompt = `
    You are an AI specialized in analyzing tweets. Your task is to extract specific semantic information from each tweet and structure your response in JSON format. Focus solely on the following properties: keyHighlight, keyTopics, and keyUsers. Ensure the JSON output strictly adheres to the specified format.
    `;

    const prompt = `
    Analyze the following tweet and return a JSON response using the generateJSONFormat function. Extract and include only the following properties:
    
    1. **keyHighlight**: Provide a concise summary or the main highlight of the tweet.
    2. **keyTopics**: List key topics or entities (such as subjects, themes, or significant concepts) mentioned in and related to the tweet. Ensure consistency across similar tweets for effective clustering.
    3. **keyUsers**: List user handles mentioned or related to the tweet.
    4. **keyEntities**: List key entities (such as company names, token names, websites, products, events) mentioned in and related to the tweet. **Do not include user handles or mentions in this list that are already included in keyUsers.** For websites, include only the domain name. If the website is an shortened URL like bitly or t.co, do not include the shortened URL. Format the entity name appropriately.

    **Tweet:** ${JSON.stringify(tweet)}
    **User Info:** ${JSON.stringify(userInfo)}
    `;

    const response = await generateObject({
      model: this.gpt4o,
      prompt,
      system: systemPrompt,
      mode: "json",
      schema: z.object({
        keyHighlight: z.string().describe("The key highlight or main point from the tweet"),
        keyTopics: z.array(z.string()).describe("List of key topics or entities (subjects, themes, or significant concepts) mentioned in and related to the tweet"),
        keyUsers: z.array(z.string()).describe("List of user handles mentioned or related to the tweet"),
        keyEntities: z.array(z.string()).describe("List of key entities (token names, websites, products, events) mentioned in the tweet, excluding user handles"),
      }),
    });

    // if (!LLM.hasResponse(response)) {
    //   throw new Error("No response from AI");
    // }

    // const extractedData = response.tool_calls?.[0]?.arguments as AiAnalyzedData;
    const extractedData = response.object;
    return extractedData;
  }

  private parseTweetsIntoMessage(searchDocuments: ParsedTweetData[]): string {
    // segment tweets by day
    const tweetsByDate = searchDocuments.reduce((acc, tweet) => {
      const date = new Date(tweet.created_at).toISOString().split("T")[0];
      acc[date] = acc[date] || [];
      acc[date].push(tweet);
      return acc;
    }, {} as Record<string, ParsedTweetData[]>);

    // format a single string message of tweets. First say Date: then the tweets
    const messages = Object.entries(tweetsByDate)
      .map(([date, tweets]) => {
        return `Date: ${date}\n${tweets
          .map((tweet) => {
            return `
            Tweeted By: ${tweet.user_name}
            Tweet: ${tweet.text}
            Quote: ${tweet.quote ? tweet.quote : ""}
            `;
          })
          .join("\n")}\n\n`;
      })
      .join("\n");

    return messages;
  }
}
