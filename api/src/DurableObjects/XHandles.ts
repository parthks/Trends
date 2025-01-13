import { DurableObject } from "cloudflare:workers";
import { ParsedTweetData, XUserInfo } from "../helpers/types";

type XHandleMetadata = {
  lastScrapedAt: number;
  oldestTweetAt: number;
  latestTweetAt: number;
};

export interface XHandle extends XUserInfo {
  metadata: XHandleMetadata & {
    lastUpdatedAt: number;
  };
}

type DOState = {
  userData: XHandle;
};

export class XHandlesObject extends DurableObject {
  sql: SqlStorage;
  userData: DOState["userData"] | null = null;

  constructor(ctx: DurableObjectState, env: CloudflareBindings) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      const userData = (await ctx.storage.get<DOState>("userData")) as any;
      this.userData = userData;
    });

    this.sql.exec(`CREATE TABLE IF NOT EXISTS tweets(
      tweet_id    TEXT PRIMARY KEY,
      tweet_date  TEXT,
      is_retweet  INTEGER,
      is_quote  INTEGER,
      is_original  INTEGER,
      tweet_conversation_id  TEXT DEFAULT NULL,
      scraped_at  INTEGER
    )`);
  }

  async deleteSelf() {
    this.sql.exec(`DROP TABLE IF EXISTS tweets`);
    await this.ctx.storage.deleteAll();
  }

  private async saveUserData() {
    return this.ctx.storage.put("userData", this.userData);
  }

  async upsertNewTweets(tweets: ParsedTweetData[], userInfo: XUserInfo) {
    await this.sql.exec(`DROP TABLE IF EXISTS tweets`);
    await this.sql.exec(`CREATE TABLE IF NOT EXISTS tweets(
      tweet_id    TEXT PRIMARY KEY,
      tweet_date  TEXT,
      is_retweet  INTEGER,
      is_quote  INTEGER,
      is_original  INTEGER,
      tweet_conversation_id  TEXT DEFAULT NULL,
      scraped_at  INTEGER
    )`);
    const scrapedAt = Date.now();
    for (const tweet of tweets) {
      const values = [
        String(tweet.id), // Ensure string
        String(tweet.created_at), // Ensure string
        Number(tweet.retweet ? 1 : 0), // Ensure number
        Number(tweet.quote ? 1 : 0), // Ensure number
        Number(!tweet.retweet && !tweet.quote ? 1 : 0), // Ensure number
        String(tweet.conversation_id || tweet.id), // Ensure string
        Number(scrapedAt), // Ensure number
      ];

      // parameterized values did not work, so we are using string interpolation
      await this.sql.exec(
        `INSERT OR REPLACE INTO tweets (tweet_id, tweet_date, is_retweet, is_quote, is_original, tweet_conversation_id, scraped_at) 
        VALUES (${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]}, ${values[5]}, ${values[6]})`
      );
    }

    const oldestTweetAt = tweets.reduce((min, tweet) => Math.min(min, tweet.created_at), Infinity);
    const latestTweetAt = tweets.reduce((max, tweet) => Math.max(max, tweet.created_at), -Infinity);

    this.upsertUser(userInfo, {
      lastScrapedAt: scrapedAt,
      oldestTweetAt,
      latestTweetAt,
    });
  }

  async getUser(): Promise<XHandle | null> {
    return this.userData || null;
  }

  async getTweets() {
    const cursor = this.sql.exec(`SELECT * FROM tweets`);
    return cursor.toArray();
  }

  async upsertUser(userInfo: XUserInfo, metadata: XHandleMetadata) {
    const userMetadata = this.userData?.metadata ?? metadata;

    if (userMetadata?.oldestTweetAt && metadata.oldestTweetAt < userMetadata.oldestTweetAt) {
      userMetadata.oldestTweetAt = metadata.oldestTweetAt;
    }

    if (userMetadata?.latestTweetAt && metadata.latestTweetAt > userMetadata.latestTweetAt) {
      userMetadata.latestTweetAt = metadata.latestTweetAt;
    }

    this.userData = {
      ...this.userData,
      ...userInfo,
      metadata: {
        ...userMetadata,
        lastScrapedAt: metadata.lastScrapedAt,
        lastUpdatedAt: Date.now(),
      },
    };
    return await this.saveUserData();
  }
}
