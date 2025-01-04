import { saveTweetsBody } from "../helpers/services";
import { FullTweetData } from "../helpers/types";

const TWEETS_LOCATION = "tweets";

export class R2TweetsStorage {
  private bucket: R2Bucket;

  constructor(binding: CloudflareBindings) {
    this.bucket = binding.TWEETS_BUCKET;
  }

  async getTweet(key: string): Promise<FullTweetData | null> {  
    const result = await this.bucket.get(key);
    if (!result) {
      return null;
    }
    return result.json();
  }

  async storeTweets(tweets: saveTweetsBody): Promise<void> {
    const promises = [];
    for(const tweet of tweets) {
      promises.push(this.bucket.put(TWEETS_LOCATION + "/" + tweet.parsedTweetData.id, JSON.stringify(tweet)));
    }
    await Promise.all(promises);
  }
}
