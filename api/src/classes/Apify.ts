import { ApifyClient } from "apify-client";
import { parseTweets, parseUserInfo } from "../helpers/parse";

interface ScrapeMetadata {
  maxItems?: number;
  until?: number;
}

const TWEET_SCRAPER_ACTOR = "61RPP7dywgiy0JPD0";

export class Scraper {
  private client: ApifyClient;

  constructor(binding: CloudflareBindings) {
    this.client = new ApifyClient({
      token: binding.APIFY_API_KEY,
    });
  }

  // async scrapeTweet(tweetId: string) {
  //   const run = await this.client.actor(TWEET_SCRAPER_ACTOR).call({
  //     searchTerms: ["from:" + userHandle + " until:" + until + " -filter:replies"],
  //     maxItems: metadata.maxItems ?? 10,
  //     sort: "Latest",
  //   });
  // }

  async scrapeUserTweets(userHandle: string, metadata: ScrapeMetadata) {
    // Prepare Actor input
    const until = metadata.until ? new Date(metadata.until).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const input = {
      searchTerms: ["from:" + userHandle + " until:" + until + " -filter:replies"],
      maxItems: metadata.maxItems ?? 10,
      sort: "Latest",
    };

    // Run the Actor and wait for it to finish
    const run = await this.client.actor(TWEET_SCRAPER_ACTOR).call(input);
    if (run.exitCode) {
      throw new Error("Failed to scrape user tweets");
    }

    // Fetch and print Actor results from the run's dataset (if any)
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    if (items.length === 1) {
      if (items[0].error) {
        console.error(items[0]);
        const error = items[0] as { code: string; message: string };
        if (error.code === "C017") {
          throw new Error("User not found");
        }
        throw new Error("Failed to scrape user tweets");
      }
    }
    const tweets = parseTweets(items as any[]);
    const userInfo = parseUserInfo(items as any[], userHandle);

    return { fullTweetData: items as any[], parsedTweetData: tweets, userInfo };
  }
}
