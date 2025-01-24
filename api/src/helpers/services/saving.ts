import { PineconeClient } from "../../classes/Pinecone";
import { R2TweetsStorage } from "../../classes/TweetsStorage";
import { TypesenseClient } from "../../classes/Typesense";
import { AiAnalyzedData, ParsedTweetData } from "../types";

export type SavedTweet = {
  scrapeRequestId?: string;
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
  // const handles = body.map((tweet) => tweet.parsedTweetData.user);
  // const uniqueHandles = [...new Set(handles)];
  // for (const handle of uniqueHandles) {
  //   const xHandleDO = getXHandleDO(env, handle);
  //   const handleParsedTweets = body.filter((tweet) => tweet.parsedTweetData.user === handle).map((tweet) => tweet.parsedTweetData);
  //   const userInfo = parseUserInfo(
  //     body.map((tweet) => tweet.fullTweetData),
  //     handle
  //   );
  //   console.log("calling upsertNewTweets with ", handleParsedTweets.length, "tweets for handle", handle);
  //   await xHandleDO.upsertNewTweets(handleParsedTweets, userInfo);
  // }
  // const trend = await Trend.getTrend(trends);
};

export const saveToTypesense = async (body: SavedTweet[], env: CloudflareBindings) => {
  // check aiAnalyzedData has all the fields, else add empty json object
  for (const tweet of body) {
    if (!tweet.aiAnalyzedData) {
      tweet.aiAnalyzedData = {
        keyHighlight: "",
        keyEntities: [],
        keyTopics: [],
        keyUsers: [],
      };
    }
    if (!tweet.aiAnalyzedData.keyEntities) {
      tweet.aiAnalyzedData.keyEntities = [];
    }
    if (!tweet.aiAnalyzedData.keyTopics) {
      tweet.aiAnalyzedData.keyTopics = [];
    }
    if (!tweet.aiAnalyzedData.keyUsers) {
      tweet.aiAnalyzedData.keyUsers = [];
    }
    if (!tweet.aiAnalyzedData.keyHighlight) {
      tweet.aiAnalyzedData.keyHighlight = "";
    }
  }

  // save to Typesense
  const typesense = new TypesenseClient(env);
  const typesenseTweetData = body.map((tweet) => ({
    ...tweet.parsedTweetData,
    ...tweet.aiAnalyzedData,
    scrapeRequestId: tweet.scrapeRequestId,
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
      metadata: pinecone.serializeToPineconeMetadata(tweet),
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestTweetData(pineconeTweetData);

  const pineconeAITweetData = body
    .map((tweet) => ({
      tweet_id: tweet.parsedTweetData.id,
      text: tweet.aiAnalyzedData.keyHighlight,
      metadata: pinecone.serializeToPineconeMetadata(tweet),
    }))
    .filter((tweet) => !!tweet.text);

  await pinecone.ingestAiHighlightsData(pineconeAITweetData);
};
