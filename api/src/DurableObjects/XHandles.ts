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
}

export class XHandlesObject extends DurableObject {
 
  sql: SqlStorage;
  userData: DOState['userData'] | null = null;

  constructor(ctx: DurableObjectState, env: CloudflareBindings) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      const state = await ctx.storage.get<DOState>("state") as any
      this.userData = state?.userData ?? null;
    });

    this.sql.exec(`CREATE TABLE IF NOT EXISTS tweets(
      tweet_id    INTEGER PRIMARY KEY,
      tweet_date  TEXT,
      is_retweet  INTEGER,
      is_quote  INTEGER,
      is_original  INTEGER,
      tweet_conversation_id  TEXT,
      scraped_at  TEXT
    )`
    );
  }

  private async saveUserData() {
    return this.ctx.storage.put("userData", this.userData);
  }

  async gotNewTweets(tweets: ParsedTweetData[]) {
    const scrapedAt = Date.now();
    for(const tweet of tweets) {
      this.sql.exec(`INSERT INTO tweets (tweet_id, tweet_date, is_retweet, is_quote, is_original, tweet_conversation_id, scraped_at) 
        VALUES (${tweet.id}, ${tweet.created_at}, ${!!tweet.retweet}, ${!!tweet.quote}, ${!tweet.retweet && !tweet.quote}, ${tweet.conversation_id}, ${scrapedAt});`);
    }

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
