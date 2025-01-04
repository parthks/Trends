import { Scraper } from "../classes/Apify";
import { R2TweetsStorage } from "../classes/TweetsStorage";
import { TypesenseClient } from "../classes/Typesense";
import { AiAnalyzedData, FullTweetData, ParsedTweetData, TypesenseTweetData } from "./types";


export type saveTweetsBody = {
  scrapeRequestId: string
  fullTweetData: FullTweetData
  parsedTweetData: ParsedTweetData
  aiAnalyzedData: AiAnalyzedData
}[]
export const saveTweets = async (body: saveTweetsBody, env: CloudflareBindings) => {
  // save to R2
  const r2 = new R2TweetsStorage(env);
  await r2.storeTweets(body);

  // save to Typesense
  const typesense = new TypesenseClient(env);
  const typesenseTweetData = body.map(tweet => ({
    ...tweet.parsedTweetData,
    ...tweet.aiAnalyzedData
  }))
  await typesense.upsertTweets(typesenseTweetData);
  console.log("saved tweets to R2 and Typesense");

  // call Trend and XHandle DOs
  // for(const tweet of body) {
  //   const trends = tweet.aiAnalyzedData.trendTopics
  //   const xHandle = tweet.aiAnalyzedData.xHandle
  //   const trend = await Trend.getTrend(trends);
  //   const xHandle = await XHandle.getXHandle(xHandle);
  // }
}

export const aiAnalyze = () => {
  console.log("aiAnalyze");
}

type userScraperConfig = {
  userId: string
  getOlder: boolean
}
type tweetScraperConfig = {
  tweetId: string
}
export type tweetsScraperBody = {
  scrapeRequest: "user" | "tweet"
  config: userScraperConfig | tweetScraperConfig
  env: CloudflareBindings
}
export const tweetsScraper = async ({ scrapeRequest, config, env }: tweetsScraperBody) => {
  // if(scrapeRequest === "user") {
  //   const { userId, getOlder } = config as userScraperConfig;
  //   const { fullTweetData, parsedTweetData, userInfo } = await new Scraper(env).scrapeUserTweets(userId, {
  //     until: getOlder ? existingUser?.metadata.oldestTweetAt : undefined,
  //   });
  // } else if(scrapeRequest === "tweet") {
  //   const { tweetId } = config as tweetScraperConfig;
  //   const { fullTweetData, parsedTweetData, userInfo } = await new Scraper(env).scrapeTweet(tweetId);
  // }
  console.log("tweetsScraper");
}