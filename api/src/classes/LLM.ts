import { AI_PROMPTS } from "../helpers/prompts";
import { AiAnalyzedData, ParsedTweetData, XUserInfo } from "../helpers/types";

export class LLM {
  private aiClient: CloudflareBindings["AI"];
  constructor(binding: CloudflareBindings) {
    this.aiClient = binding.AI;
  }

  static hasResponse(output: AiTextGenerationOutput): output is {
    response: string;
    tool_calls?: {
      name: string;
      arguments: unknown;
    }[];
  } {
    return output !== null && typeof output === "object" && !output.constructor?.name?.includes("ReadableStream") && "response" in output && typeof output.response === "string";
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
    const prompt = AI_PROMPTS.ANALYZE_TWEET.prompt + `\n\nTweet: ${JSON.stringify(tweet)}\n\nUser Info: ${JSON.stringify(userInfo)}`;
    const systemPrompt = AI_PROMPTS.ANALYZE_TWEET.systemPrompt;
    const response = await this.aiClient.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    if (!LLM.hasResponse(response)) {
      throw new Error("No response from AI");
    }
    return { keyMentions: [], keyHighlight: response.response, trendTopics: [] };
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
