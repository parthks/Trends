import { DurableObject } from "cloudflare:workers";
import { FullTweetData, ParsedTweetData, XUserInfo } from "../helpers/types";
import { AiAnalyzeBody } from "../helpers/services/aiAnalyzing";
import { SavedTweet } from "../helpers/services/saving";
import { getXHandleDO, removeDuplicates } from "../helpers/utils";

export type UserScraperConfig = {
  userId: string;
  until?: number;
  maxItems?: number;
};
type tweetScraperConfig = {
  tweetId: string;
};
export type TweetsScraperBody = {
  scrapeRequestId: string;
  scrapeRequest: "user";
  config: UserScraperConfig | tweetScraperConfig;
};

enum ScrapeRequestStatus {
  PENDING = "pending",
  SCRAPING = "scraping",
  AI_ANALYZING = "ai_analyzing",
  SAVING = "saving",
  COMPLETED = "completed",
  FAILED = "failed",
}

type ScrapeData = {
  scrapeRequestId: string;
  scrapeRequestDate: number;
  scrapeRequestStatus: ScrapeRequestStatus;

  scrapeStartedDate?: number;
  scrapeCompletedDate?: number;
  aiAnalyzedCompletedDate?: number;
  savedCompletedDate?: number;

  scrapeRequestError?: string;
  scrapeConfigData: ScrapeConfigData;

  scrapedTweetIds?: string[];
  aiAnalyzedTweetIds?: string[];
  savedTweetIds?: string[];
};

type ScrapeConfigData = Omit<TweetsScraperBody, "scrapeRequestId">;

type DOState = {
  scrapeData: ScrapeData;
};

export class ScrapeRequestsObject extends DurableObject {
  scrapeState!: DOState["scrapeData"];
  TWEETS_SCRAPER_QUEUE: Queue;
  AI_ANALYZER_QUEUE: Queue;
  SCRAPE_REQUESTS_KV: KVNamespace;

  env: CloudflareBindings;

  constructor(ctx: DurableObjectState, env: CloudflareBindings) {
    super(ctx, env);
    this.TWEETS_SCRAPER_QUEUE = env.TWEETS_SCRAPER_QUEUE;
    this.AI_ANALYZER_QUEUE = env.AI_ANALYZER_QUEUE;

    this.SCRAPE_REQUESTS_KV = env.SCRAPE_REQUESTS_KV;
    this.env = env;
    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      const scrapeState = (await ctx.storage.get<DOState>("scrapeState")) as any;
      this.scrapeState = scrapeState;
    });
  }

  private async saveData() {
    return this.ctx.storage.put("scrapeState", this.scrapeState);
  }

  async getData(): Promise<ScrapeData | null> {
    console.log("scrapeState", this.scrapeState);
    const data = await this.ctx.storage.get("scrapeState");
    return data as ScrapeData | null;
  }

  async startedScraping() {
    this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.SCRAPING;
    this.scrapeState.scrapeStartedDate = Date.now();
    await this.saveData();
  }

  async failedScraping(error: string) {
    this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.FAILED;
    this.scrapeState.scrapeRequestError = error;
    await this.saveData();
  }

  async doneScraping(fullTweetData: FullTweetData[]) {
    this.scrapeState.scrapedTweetIds = fullTweetData.map((fullTweet) => fullTweet.id);

    for (const tweetData of fullTweetData) {
      const body: AiAnalyzeBody = {
        scrapeRequestId: this.scrapeState.scrapeRequestId,
        fullTweetData: tweetData,
      };
      this.scrapeState.scrapedTweetIds = removeDuplicates([...(this.scrapeState.scrapedTweetIds || []), tweetData.id]);
      await this.AI_ANALYZER_QUEUE.send(body);
    }

    this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.AI_ANALYZING;
    this.scrapeState.scrapeCompletedDate = Date.now();

    await this.saveData();
  }

  async doneAiAnalyzing(tweet_id: string) {
    this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.AI_ANALYZING;
    this.scrapeState.aiAnalyzedTweetIds = removeDuplicates([...(this.scrapeState.aiAnalyzedTweetIds || []), tweet_id]);

    if (this.scrapeState.scrapedTweetIds?.length === this.scrapeState.aiAnalyzedTweetIds?.length) {
      this.scrapeState.aiAnalyzedCompletedDate = Date.now();
      this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.SAVING;
    }
    await this.saveData();
  }

  async doneSaving(tweet_ids: string[]) {
    this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.SAVING;
    this.scrapeState.savedTweetIds = removeDuplicates([...(this.scrapeState.savedTweetIds || []), ...tweet_ids]);

    if (this.scrapeState.scrapedTweetIds?.length === this.scrapeState.savedTweetIds?.length) {
      this.scrapeState.savedCompletedDate = Date.now();
      this.scrapeState.scrapeRequestStatus = ScrapeRequestStatus.COMPLETED;
    }
    await this.saveData();
  }

  async startNewScrape(scrapeRequest: TweetsScraperBody) {
    const { scrapeRequestId, ...scrapeConfigData } = scrapeRequest;
    if (scrapeConfigData.scrapeRequest == "user") {
      const config = scrapeConfigData.config as UserScraperConfig;
      // if until is not set, get it from the oldest tweet in the database
      if (!config.until) {
        const handlerDO = getXHandleDO(this.env, config.userId);
        const user = await handlerDO.getUser();
        if (!user) {
          config.until = Date.now();
        } else {
          config.until = user.metadata?.oldestTweetAt;
        }
      }
    }
    this.scrapeState = {
      scrapeRequestId: scrapeRequest.scrapeRequestId,
      scrapeRequestDate: Date.now(),
      scrapeRequestStatus: ScrapeRequestStatus.PENDING,
      scrapeConfigData,
    };
    await this.SCRAPE_REQUESTS_KV.put(this.scrapeState.scrapeRequestId, JSON.stringify({ scrapeRequestDate: this.scrapeState.scrapeRequestDate }));
    await this.TWEETS_SCRAPER_QUEUE.send(scrapeRequest);
    await this.saveData();
  }

  async deleteSelf() {
    const id = this.scrapeState?.scrapeRequestId;
    await this.ctx.storage.deleteAll();
    if (!id) return;
    await this.SCRAPE_REQUESTS_KV.delete(id);
  }
}
