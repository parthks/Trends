import { Scraper } from "../../classes/Apify";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { TweetsScraperBody, UserScraperConfig } from "../../DurableObjects/ScrapeRequests";
import { parseTweets } from "../parse";
import { FullTweetData, ParsedTweetData, XUserInfo } from "../types";
import { getScrapeRequestDO } from "../utils";

export const tweetsScraper = async (body: TweetsScraperBody, env: CloudflareBindings) => {
  const { scrapeRequestId, scrapeRequest, config } = body;
  let fullTweetData: FullTweetData[] = [];

  console.log("started scraping", scrapeRequestId, config);

  if (scrapeRequest === "user") {
    const { userId, until, maxItems } = config as UserScraperConfig;
    const results = await new Scraper(env).scrapeUserTweets(userId, {
      until: until,
      maxItems: maxItems,
    });
    fullTweetData = results.fullTweetData;
  }

  console.log("done scraping", scrapeRequestId, "fullTweetData", fullTweetData.length);
  // check if we already have any of the retweets, but why not just check all... saves an AI call
  const parsedTweetData = await parseTweets(fullTweetData);

  const tweetIds = parsedTweetData.map((tweet) => tweet.id);
  const existingTweets = await new R2TweetsStorage(env).checkTweetExists(tweetIds);

  const parsedTweetDataToSave = parsedTweetData.filter((tweet) => {
    return !existingTweets[tweet.id];
  });

  const fullTweetDataToSave = parsedTweetDataToSave.map((parsedTweet) => {
    // if (parsedTweet.sourced_from_retweet_by_tweet_id) {
    //   const tweet = fullTweetData.find((tweet) => tweet.id === parsedTweet.sourced_from_retweet_by_tweet_id);
    //   if (!tweet) throw new Error("sourced_from_retweet_by_tweet_id not found");
    //   return tweet;
    // }
    const tweet = fullTweetData.find((tweet) => tweet.id === parsedTweet.id);
    if (!tweet) throw new Error("Tweet not found from parsedTweetDataToSave");
    return tweet;
  });

  await doneScrapingTweets(
    scrapeRequestId,
    {
      fullTweetData: fullTweetDataToSave,
      parsedTweetData: parsedTweetDataToSave,
    },
    env
  );
};

type DoneScrapingTweetsBody = {
  fullTweetData: FullTweetData[];
  parsedTweetData: ParsedTweetData[];
};
const doneScrapingTweets = async (scrapeRequestId: string, body: DoneScrapingTweetsBody, env: CloudflareBindings) => {
  const { fullTweetData } = body;
  await new R2TweetsStorage(env).storeRawFullTweets(fullTweetData);

  const stub = getScrapeRequestDO(env, scrapeRequestId);
  await stub.doneScraping(fullTweetData);
};
