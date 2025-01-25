import { SavedTweet } from "../helpers/services/saving";
import { FullTweetData, TrendSnapshot } from "../helpers/types";

const TWEETS_LOCATION = "tweets";
const RAW_TWEETS_LOCATION = "tweets/raw";

const TRENDS_LOCATION = "trends";

export class R2TweetsStorage {
  private bucket: R2Bucket;

  constructor(binding: CloudflareBindings) {
    this.bucket = binding.TWEETS_BUCKET;
  }

  async storeTrend(trend: TrendSnapshot) {
    await this.bucket.put(TRENDS_LOCATION + "/" + trend.id, JSON.stringify(trend));
  }

  async getTrend(id: string): Promise<TrendSnapshot | null> {
    const result = await this.bucket.get(TRENDS_LOCATION + "/" + id);
    if (!result) {
      return null;
    }
    return result.json();
  }

  async getAllTrends(): Promise<TrendSnapshot[]> {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    const trends = await Promise.all(result.objects.filter((obj) => obj.key.startsWith(TRENDS_LOCATION)).map((obj) => this.bucket.get(obj.key).then((res) => res?.json())));
    return trends as TrendSnapshot[];
  }

  async deleteTrend(id: string): Promise<void> {
    await this.bucket.delete(TRENDS_LOCATION + "/" + id);
  }

  async deleteAll() {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    for (const obj of result.objects) {
      if (obj.key.startsWith(RAW_TWEETS_LOCATION)) continue;
      console.log("Deleting tweet: " + obj.key);
      await this.bucket.delete(obj.key);
    }
  }

  async deleteRawFullTweetDataByIds(ids: string[]): Promise<void> {
    const p1 = ids.map((id) => this.bucket.delete(RAW_TWEETS_LOCATION + "/" + id));
    const p2 = ids.map((id) => this.bucket.delete(TWEETS_LOCATION + "/" + id));
    await Promise.all([...p1, ...p2]);
  }

  async listTweetIds(): Promise<string[]> {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    return result.objects.filter((obj) => !obj.key.startsWith(RAW_TWEETS_LOCATION)).map((obj) => obj.key.replace(TWEETS_LOCATION + "/", ""));
  }

  async listRawTweetIds(): Promise<string[]> {
    const result = await this.bucket.list({ include: ["customMetadata"], limit: 1000 });
    return result.objects.filter((obj) => obj.key.includes(RAW_TWEETS_LOCATION)).map((obj) => obj.key.replace(RAW_TWEETS_LOCATION + "/", ""));
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
    const promises = ids.map((id) => this.bucket.head(TWEETS_LOCATION + "/" + id));
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
