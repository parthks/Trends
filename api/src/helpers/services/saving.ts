import { InputPineconeRecordMetadata, PineconeClient } from "../../classes/Pinecone";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { TypesenseClient } from "../../classes/Typesense";
import { parseUserInfo } from "../parse";
import { FullTweetData, ParsedTweetData, AiAnalyzedData } from "../types";
import { getXHandleDO } from "../utils";

export type SavedTweet = {
  scrapeRequestId?: string;
  fullTweetData: FullTweetData;
  parsedTweetData: ParsedTweetData;
  aiAnalyzedData: AiAnalyzedData;
};
// number of parsed tweets may be less than the number of full tweets because we group the thread tweets into one parsed tweet
export const saveTweets = async (body: SavedTweet[], env: CloudflareBindings) => {
  // save to R2
  const r2 = new R2TweetsStorage(env);
  await r2.storeTweets(body);
  await saveToPinecone(body, env);
  await saveToTypesense(body, env);

  // call Trend and XHandle DOs
  const handles = body.map((tweet) => tweet.parsedTweetData.user);
  for (const handle of handles) {
    const xHandleDO = getXHandleDO(env, handle);
    const handleParsedTweets = body.filter((tweet) => tweet.parsedTweetData.user === handle).map((tweet) => tweet.parsedTweetData);
    const userInfo = parseUserInfo(
      body.map((tweet) => tweet.fullTweetData),
      handle
    );
    console.log("calling upsertNewTweets");
    await xHandleDO.upsertNewTweets(handleParsedTweets, userInfo);
  }
  // const trend = await Trend.getTrend(trends);
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

const makePineconeMetadata = (tweet: SavedTweet): InputPineconeRecordMetadata => {
  return {
    user: tweet.parsedTweetData.user,
    scrapeRequestId: tweet.scrapeRequestId,
    keyUsers: tweet.aiAnalyzedData.keyUsers,
    keyTopics: tweet.aiAnalyzedData.keyTopics,
    keyEntities: tweet.aiAnalyzedData.keyEntities,
    keyHighlight: tweet.aiAnalyzedData.keyHighlight,
  };
};

export const saveToPinecone = async (body: SavedTweet[], env: CloudflareBindings) => {
  // save to Pinecone
  const pinecone = new PineconeClient(env);
  const pineconeTweetData = body
    .map((tweet) => ({
      tweet_id: tweet.parsedTweetData.id,
      text: (tweet.parsedTweetData.quote ?? "") + (tweet.parsedTweetData.text ?? ""),
      metadata: makePineconeMetadata(tweet),
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestTweetData(pineconeTweetData);

  const pineconeAITweetData = body
    .map((tweet) => ({
      tweet_id: tweet.parsedTweetData.id,
      text: tweet.aiAnalyzedData.keyHighlight,
      metadata: makePineconeMetadata(tweet),
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestAiHighlightsData(pineconeAITweetData);
};
