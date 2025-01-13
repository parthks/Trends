import { LLM } from "../../classes/LLM";
import { parseTweets, parseUserInfo } from "../parse";
import { FullTweetData } from "../types";
import { SavedTweet } from "./saving";

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
