import { Scraper } from "../classes/Apify";
import { LLM } from "../classes/LLM";
import { InputPineconeRecordMetadata, PineconeClient } from "../classes/Pinecone";
import { R2TweetsStorage } from "../classes/TweetsStorage";
import { TypesenseClient } from "../classes/Typesense";
import { parseTweets, parseUserInfo } from "./parse";
import { AiAnalyzedData, FullTweetData, ParsedTweetData, XUserInfo } from "./types";

export type SavedTweet = {
  scrapeRequestId?: string;
  fullTweetData: FullTweetData;
  parsedTweetData: ParsedTweetData;
  aiAnalyzedData: AiAnalyzedData;
};
export const saveTweets = async (body: SavedTweet[], env: CloudflareBindings) => {
  // save to R2
  const r2 = new R2TweetsStorage(env);
  await r2.storeTweets(body);
  await saveToPinecone(body, env);
  await saveToTypesense(body, env);

  // call Trend and XHandle DOs
  // for(const tweet of body) {
  //   const trends = tweet.aiAnalyzedData.trendTopics
  //   const xHandle = tweet.aiAnalyzedData.xHandle
  //   const trend = await Trend.getTrend(trends);
  //   const xHandle = await XHandle.getXHandle(xHandle);
  // }
};

export const saveToTypesense = async (body: SavedTweet[], env: CloudflareBindings) => {
  // save to Typesense
  const typesense = new TypesenseClient(env);
  const typesenseTweetData = body.map((tweet) => ({
    ...tweet.parsedTweetData,
    ...tweet.aiAnalyzedData,
  }));
  await typesense.upsertTweets(typesenseTweetData);
};

export const saveToPinecone = async (body: SavedTweet[], env: CloudflareBindings) => {
  // save to Pinecone
  const pinecone = new PineconeClient(env);
  const pineconeTweetData = body
    .map((tweet) => ({
      tweet_id: tweet.parsedTweetData.id,
      text: (tweet.parsedTweetData.quote ?? "") + (tweet.parsedTweetData.text ?? ""),
      metadata: {
        user: tweet.parsedTweetData.user,
        scrapeRequestId: tweet.scrapeRequestId,
        keyMentions: tweet.aiAnalyzedData.keyMentions,
        trendTopics: tweet.aiAnalyzedData.trendTopics,
      } as InputPineconeRecordMetadata,
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestTweetData(pineconeTweetData);

  const pineconeAITweetData = body
    .map((tweet) => ({
      tweet_id: tweet.parsedTweetData.id,
      text: tweet.aiAnalyzedData.keyHighlight,
      metadata: {
        user: tweet.parsedTweetData.user,
        scrapeRequestId: tweet.scrapeRequestId,
        keyMentions: tweet.aiAnalyzedData.keyMentions,
        trendTopics: tweet.aiAnalyzedData.trendTopics,
      } as InputPineconeRecordMetadata,
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestAiHighlightsData(pineconeAITweetData);
};

export type AiAnalyzeBody = {
  scrapeRequestId?: string;
  fullTweetData: FullTweetData;
};
export const aiAnalyzeInQueue = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const result = await aiAnalyze(body, env);

  const saveTweetsBody: SavedTweet = {
    scrapeRequestId: body.scrapeRequestId,
    fullTweetData: body.fullTweetData,
    parsedTweetData: result.parsedTweetData,
    aiAnalyzedData: result.aiAnalyzedData,
  };
  await env.SAVE_TWEETS_QUEUE.send(saveTweetsBody);
};

export const aiAnalyze = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const { scrapeRequestId, fullTweetData } = body;

  const parsedTweetsData = parseTweets([fullTweetData]);
  const parsedTweetData = parsedTweetsData[0];
  const userInfo = parseUserInfo([fullTweetData], parsedTweetData.user);

  const llm = new LLM(env);
  const aiAnalyzedData = await llm.analyzeTweet(parsedTweetData, userInfo);
  return { scrapeRequestId, userInfo, parsedTweetData, aiAnalyzedData };
};

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
  const { fullTweetData, parsedTweetData, userInfo } = body;
  await new R2TweetsStorage(env).storeRawFullTweets(fullTweetData);
  const aiAnalyzeBody: AiAnalyzeBody[] = parsedTweetData.map((parsedTweet) => {
    const fullTweet = fullTweetData.find((fullTweet) => fullTweet.id === parsedTweet.id);
    if (!fullTweet) {
      throw new Error(`Full tweet not found for tweet id: ${parsedTweet.id}`);
    }
    return { scrapeRequestId, fullTweetData: fullTweet };
  });
  for (const body of aiAnalyzeBody) {
    await env.AI_ANALYZER_QUEUE.send(body);
  }
};
