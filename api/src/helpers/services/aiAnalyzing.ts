import { LLM } from "../../classes/LLM";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { parseTweets } from "../parse";
import { FullTweetData, ParsedTweetData, XUserInfo } from "../types";
import { SavedTweet } from "./saving";

export type AiAnalyzeBody = {
  scrapeRequestId?: string;
  fullTweetData: FullTweetData;
};
export const aiAnalyzeInQueue = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const result = await aiAnalyze(body, env);
  const parsedTweetData = parseTweets([result.fullTweetData]);

  const saveTweetsBody: SavedTweet = {
    scrapeRequestId: body.scrapeRequestId,
    parsedTweetData: parsedTweetData[0],
    aiAnalyzedData: result.aiAnalyzedData,
  };
  await env.SAVE_TWEETS_QUEUE.send(saveTweetsBody);
};

export const aiAnalyze = async (body: AiAnalyzeBody, env: CloudflareBindings) => {
  const { scrapeRequestId, fullTweetData } = body;

  const llm = new LLM(env);
  const parsedTweetData = parseTweets([fullTweetData]);
  const aiAnalyzedData = await llm.analyzeTweet(parsedTweetData[0], fullTweetData.author);
  console.log("aiAnalyzedData", aiAnalyzedData);
  // fix user names, if they do start with @, add the @
  aiAnalyzedData.keyUsers = aiAnalyzedData.keyUsers.map((user) => (user.startsWith("@") ? user : `@${user}`));
  return { scrapeRequestId, fullTweetData, aiAnalyzedData };
};
