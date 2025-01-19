import { LLM } from "../../classes/LLM";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { ParsedTweetData, XUserInfo } from "../types";
import { SavedTweet } from "./saving";

export type AiAnalyzeBody = {
  scrapeRequestId?: string;
  parsedTweetData: ParsedTweetData;
  userInfo: XUserInfo;
};
export const aiAnalyzeInQueue = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const result = await aiAnalyze(body, env);

  const fullTweetData = await new R2TweetsStorage(env).getRawFullTweetDataByID(result.parsedTweetData.id);
  if (!fullTweetData) {
    throw new Error("aiAnalyzeInQueue: Failed to get full tweet data from R2 storage");
  }

  const saveTweetsBody: SavedTweet = {
    scrapeRequestId: body.scrapeRequestId,
    fullTweetData: fullTweetData,
    parsedTweetData: result.parsedTweetData,
    aiAnalyzedData: result.aiAnalyzedData,
  };
  await env.SAVE_TWEETS_QUEUE.send(saveTweetsBody);
};

export const aiAnalyze = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const { scrapeRequestId, parsedTweetData, userInfo } = body;

  const llm = new LLM(env);
  const aiAnalyzedData = await llm.analyzeTweet(parsedTweetData, userInfo);
  // fix user names, if they do start with @, add the @
  aiAnalyzedData.keyUsers = aiAnalyzedData.keyUsers.map((user) => (user.startsWith("@") ? user : `@${user}`));
  return { scrapeRequestId, userInfo, parsedTweetData, aiAnalyzedData };
};
