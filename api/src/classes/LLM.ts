import { AI_PROMPTS } from "../helpers/prompts";
import { AiAnalyzedData, ParsedTweetData, XUserInfo } from "../helpers/types";
import { runWithTools } from "@cloudflare/ai-utils";

export class LLM {
  private aiClient: CloudflareBindings["AI"];
  constructor(binding: CloudflareBindings) {
    this.aiClient = binding.AI;
  }

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
    const response = await this.aiClient.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [{ role: "user", content: prompt }],
    });
    return response;
  }

  async summarizeTweets(tweets: ParsedTweetData[]) {
    const tweetsMessage = this.parseTweetsIntoMessage(tweets);
    const prompt = `
    Summarize the key updates from tweets. Use only the provided tweets as the source material, and avoid repeating anything. If there is an external link in the tweets (like to a website or blog), include it so people can easily explore more.
    Focus on delivering a concise, actionable summary without unnecessary openings or conclusions. Use a friendly but efficient tone, and only include the essential updates.
    \n\nTweets Data:\n${tweetsMessage}`;

    const response = await this.aiClient.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant expert in summarizing tweets. Do not include any helper text in your response. Only output the summary. ",
          },
          { role: "user", content: prompt },
        ],
      },
      { gateway: { id: "trends" } }
    );
    return response;
  }

  async analyzeTweet(tweet: ParsedTweetData, userInfo: XUserInfo): Promise<AiAnalyzedData> {
    const systemPrompt = `
    You are an AI specialized in analyzing tweets. Your task is to extract specific semantic information from each tweet and structure your response using the generateJSONFormat function. Focus solely on the following properties: keyHighlight, keyTopics, and keyUsers. Ensure the JSON output strictly adheres to the specified format.
    `;

    const prompt = `
    Analyze the following tweet and return a JSON response using the generateJSONFormat function. Extract and include only the following properties:
    
    1. **keyHighlight**: Provide a concise summary or the main highlight of the tweet.
    2. **keyTopics**: List key topics or entities (such as subjects, themes, or significant concepts) mentioned in and related to the tweet. Ensure consistency across similar tweets for effective clustering.
    3. **keyUsers**: List user handles mentioned or related to the tweet.
    4. **keyEntities**: List key entities (such as token names, websites, products, events) mentioned in and related to the tweet. **Do not include user handles or mentions in this list that are already included in keyUsers.**

    **Tweet:** ${JSON.stringify(tweet)}
    **User Info:** ${JSON.stringify(userInfo)}
    `;

    const response = await this.aiClient.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          name: "generateJSONFormat",
          description: "Use this function to format your response as JSON",
          parameters: {
            type: "object",
            properties: {
              keyHighlight: {
                type: "string",
                description: "The key highlight in the tweet",
              },
              keyEntities: {
                type: "array",
                description: "Strings of key entities such as token names, websites, products, events mentioned in the tweet",
              },
              keyTopics: {
                type: "array",
                description: "Strings of key topics or entities mentioned in and related to the tweet",
              },
              keyUsers: {
                type: "array",
                description: "Strings of key users mentioned in and related to the tweet",
              },
            },
            required: ["keyHighlight", "keyTopics", "keyUsers", "keyEntities"],
          },
        },
      ],
    });

    if (!LLM.hasResponse(response)) {
      throw new Error("No response from AI");
    }

    const extractedData = response.tool_calls?.[0]?.arguments as AiAnalyzedData;

    return extractedData;
  }

  private parseTweetsIntoMessage(searchDocuments: ParsedTweetData[]): string {
    // First, create a map to track which original tweets we've seen
    const seenOriginalTweets = new Set<string>();

    // Filter out duplicate retweets
    const filteredDocuments = searchDocuments.filter((tweet) => {
      if (!tweet.original_tweet_id) {
        // Keep all non-retweets
        return true;
      }

      // For retweets, if we have the original tweet in our set, filter out this retweet
      if (searchDocuments.find((t) => t.id === tweet.original_tweet_id)) {
        return false;
      }

      // check if we've seen this original_tweet_id before
      if (!seenOriginalTweets.has(tweet.original_tweet_id)) {
        // If we haven't seen it, add it to our set and keep this retweet
        seenOriginalTweets.add(tweet.original_tweet_id);
        return true;
      }

      // If we've seen this original_tweet_id before, filter out this retweet
      return false;
    });

    // segment tweets by day
    const tweetsByDate = filteredDocuments.reduce((acc, tweet) => {
      const date = new Date(tweet.created_at * 1000).toISOString();
      acc[date] = acc[date] || [];
      acc[date].push(tweet);
      return acc;
    }, {} as Record<string, ParsedTweetData[]>);

    // format a single string message of tweets. First say Date: then the tweets
    const messages = Object.entries(tweetsByDate)
      .map(([date, tweets]) => {
        return `Date: ${date}\n${tweets
          .map((tweet) => {
            return `Tweet: ${tweet.text || tweet.retweet}\n 
                      ${tweet.quote ? `Quote: ${tweet.quote}` : ""}\n`;
          })
          .join("\n")}\n\n`;
      })
      .join("\n");

    return messages;
  }
}
