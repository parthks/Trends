import { Scraper } from "../../classes/Apify";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { FullTweetData, ParsedTweetData, XUserInfo } from "../types";
import { getScrapeRequestDO } from "../utils";

type userScraperConfig = {
  userId: string;
  until?: number;
};
type tweetScraperConfig = {
  tweetId: string;
};
export type TweetsScraperBody = {
  scrapeRequestId: string;
  scrapeRequest: "user";
  config: userScraperConfig | tweetScraperConfig;
};
export const tweetsScraper = async (body: TweetsScraperBody, env: CloudflareBindings) => {
  const { scrapeRequestId, scrapeRequest, config } = body;
  let fullTweetData: any[] = [];
  let parsedTweetData: ParsedTweetData[] = [];
  let userInfo: XUserInfo | undefined;

  if (scrapeRequest === "user") {
    const { userId, until } = config as userScraperConfig;
    const results = await new Scraper(env).scrapeUserTweets(userId, {
      until: until,
    });
    fullTweetData = results.fullTweetData;
    parsedTweetData = results.parsedTweetData;
    userInfo = results.userInfo;
  }

  await doneScrapingTweets(
    scrapeRequestId,
    {
      fullTweetData,
      parsedTweetData,
      userInfo: userInfo as XUserInfo,
    },
    env
  );
};

type DoneScrapingTweetsBody = {
  fullTweetData: FullTweetData[];
  parsedTweetData: ParsedTweetData[];
  userInfo: XUserInfo;
};
const doneScrapingTweets = async (scrapeRequestId: string, body: DoneScrapingTweetsBody, env: CloudflareBindings) => {
  const { fullTweetData } = body;
  await new R2TweetsStorage(env).storeRawFullTweets(fullTweetData);

  const stub = getScrapeRequestDO(env, scrapeRequestId);
  await stub.doneScraping(fullTweetData);
};
