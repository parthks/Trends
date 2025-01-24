import { SavedTweet } from "../helpers/services/saving";
import { FullTweetData } from "../helpers/types";

const TWEETS_LOCATION = "tweets";
const RAW_TWEETS_LOCATION = "tweets/raw";

export class R2TweetsStorage {
  private bucket: R2Bucket;

  constructor(binding: CloudflareBindings) {
    this.bucket = binding.TWEETS_BUCKET;
  }

  async deleteAll() {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    for (const obj of result.objects) {
      if (obj.key.startsWith(RAW_TWEETS_LOCATION)) continue;
      console.log("Deleting tweet: " + obj.key);
      await this.bucket.delete(obj.key);
    }
  }

  async listTweetIds(): Promise<string[]> {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    return result.objects.filter((obj) => !obj.key.startsWith(RAW_TWEETS_LOCATION)).map((obj) => obj.key.replace(TWEETS_LOCATION + "/", ""));
  }

  async getTweetByID(id: string): Promise<FullTweetData | SavedTweet | null> {
    const result = await this.bucket.get(TWEETS_LOCATION + "/" + id);
    if (!result) {
      return null;
    }
    return result.json();
  }

  async checkTweetExists(id: string | string[]): Promise<Record<string, boolean>> {
    const ids = Array.isArray(id) ? id : [id];
    const promises = ids.map((id) => this.bucket.head(RAW_TWEETS_LOCATION + "/" + id));
    const results = await Promise.all(promises);
    return results.reduce((acc, result, index) => {
      acc[ids[index]] = result !== null;
      return acc;
    }, {} as Record<string, boolean>);
  }

  async getTweetDataByID(id: string): Promise<SavedTweet | null> {
    const result = await this.bucket.get(TWEETS_LOCATION + "/" + id);
    if (!result) {
      return null;
    }
    return result.json();
  }

  async storeTweets(tweets: SavedTweet[]): Promise<void> {
    const promises = [];
    for (const tweet of tweets) {
      promises.push(this.bucket.put(TWEETS_LOCATION + "/" + tweet.parsedTweetData.id, JSON.stringify(tweet)));
    }
    await Promise.all(promises);
  }

  async getRawFullTweetDataByID(id: string): Promise<FullTweetData | null> {
    const result = await this.bucket.get(RAW_TWEETS_LOCATION + "/" + id);
    if (!result) {
      return null;
    }
    return result.json();
  }

  async storeRawFullTweets(tweets: FullTweetData[]): Promise<void> {
    const promises = [];
    for (const tweet of tweets) {
      if (!tweet.id) {
        throw new Error("Tweet ID not found in tweet: " + JSON.stringify(tweet));
      }
      promises.push(this.bucket.put(RAW_TWEETS_LOCATION + "/" + tweet.id, JSON.stringify(tweet)));
    }
    await Promise.all(promises);
  }
}
