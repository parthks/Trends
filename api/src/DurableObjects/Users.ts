import { DurableObject } from "cloudflare:workers";
import { UserInfo } from "../helpers/types";

type UserMetadata = {
  lastScrapedAt: number;
  oldestTweetAt: number;
  latestTweetAt: number;
};

export interface User extends UserInfo {
  metadata: UserMetadata & {
    lastUpdatedAt: number;
  };
}

export class UsersObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: CloudflareBindings) {
    super(ctx, env);
  }

  async getUser(userId: string): Promise<User | null> {
    let result = await this.ctx.storage.get<User>(userId);
    if (!result) {
      return null;
    }
    return result;
  }

  async upsertUser(userInfo: UserInfo, metadata: UserMetadata) {
    const user = await this.getUser(userInfo.userName);
    const userMetadata = user?.metadata ?? metadata;

    if (userMetadata?.oldestTweetAt && metadata.oldestTweetAt < userMetadata.oldestTweetAt) {
      userMetadata.oldestTweetAt = metadata.oldestTweetAt;
    }

    if (userMetadata?.latestTweetAt && metadata.latestTweetAt > userMetadata.latestTweetAt) {
      userMetadata.latestTweetAt = metadata.latestTweetAt;
    }

    const updatedUser: User = {
      ...user,
      ...userInfo,
      metadata: {
        ...userMetadata,
        lastScrapedAt: metadata.lastScrapedAt,
        lastUpdatedAt: Date.now(),
      },
    };
    return await this.ctx.storage.put(userInfo.userName, updatedUser);
  }
}
