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
  // check if we already have any of the retweets
  const retweetIds = fullTweetData.filter((tweet) => tweet.isRetweet && tweet.retweet?.id).map((tweet) => tweet.retweet!.id);
  const existingRetweets = await new R2TweetsStorage(env).checkTweetExists(retweetIds);

  const fullTweetDataToSave = fullTweetData.filter((tweet) => {
    if (tweet.isRetweet && tweet.retweet?.id) {
      return !existingRetweets[tweet.retweet!.id];
    }
    return true;
  });
  const parsedTweetData = await parseTweets(fullTweetDataToSave);

  await doneScrapingTweets(
    scrapeRequestId,
    {
      fullTweetData: fullTweetDataToSave,
      parsedTweetData,
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
