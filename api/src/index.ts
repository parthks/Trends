import { Hono } from "hono";
import { Scraper } from "./classes/Apify";
import { LLM } from "./classes/LLM";
import { PineconeClient, PineconeNamespace } from "./classes/Pinecone";
import { R2TweetsStorage } from "./classes/TweetsStorage";
import { TypesenseClient } from "./classes/Typesense";
import { XHandle, XHandlesObject } from "./DurableObjects/XHandles";
import { ScrapeRequestsObject } from "./DurableObjects/ScrapeRequests";
import { getScrapeRequestDO, getXHandleDO } from "./helpers/utils";
import { AiAnalyzeBody, aiAnalyze, aiAnalyzeInQueue } from "./helpers/services/aiAnalyzing";
import { SavedTweet, saveTweets, saveToPinecone, saveToTypesense } from "./helpers/services/saving";
import { TweetsScraperBody, tweetsScraper } from "./helpers/services/scraping";

export { XHandlesObject, ScrapeRequestsObject };

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.onError(async (err, c) => {
  const error = {
    name: err.name,
    message: err.message,
    cause: err.cause,
    stack: err.stack,
  };
  await c.env.ERROR_QUEUE.send(error);
  return c.json(error, { status: 500 });
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: CloudflareBindings) {
    switch (batch.queue) {
      case "error-queue":
        for (const message of batch.messages) {
          const error = message.body as Error;
          await env.ERROR_BUCKET.put(`errors/${Date.now()}.log`, JSON.stringify(error));
        }
        break;
      case "tweets-scraper-queue":
        const scraperData = batch.messages.map((message) => message.body) as TweetsScraperBody[];
        for (const data of scraperData) {
          const stub = getScrapeRequestDO(env, data.scrapeRequestId);
          await stub.startedScraping();
          await tweetsScraper(data, env);
        }
        break;
      case "ai-analyzer-queue":
        const aiData = batch.messages.map((message) => message.body) as AiAnalyzeBody[];
        for (const data of aiData) {
          await aiAnalyzeInQueue(data, env);
          if (data.scrapeRequestId) {
            const stub = getScrapeRequestDO(env, data.scrapeRequestId);
            await stub.doneAiAnalyzing(data.fullTweetData.id);
          }
        }
        break;
      case "save-tweets-queue":
        const saveData = batch.messages.map((message) => message.body) as SavedTweet[];
        await saveTweets(saveData, env);
        const scrapeRequestIds = saveData.map((s) => s.scrapeRequestId).filter((id) => id !== undefined);
        for (const scrapeRequestId of scrapeRequestIds) {
          const stub = getScrapeRequestDO(env, scrapeRequestId);
          await stub.doneSaving(saveData.filter((s) => s.scrapeRequestId === scrapeRequestId).map((s) => s.fullTweetData.id));
        }
        break;
      default:
        console.log("unknown queue", batch.queue);
    }
  },
};

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ai", async (c) => {
  const llmResult = await new LLM(c.env).introduce("introduce yourself");
  if (LLM.hasResponse(llmResult) && llmResult.response) {
    return c.text(llmResult.response);
  }
  return c.text("No result");
});

app.get("/storage/tweets", async (c) => {
  const tweets = await new R2TweetsStorage(c.env).listTweets();
  return c.json(tweets);
});

app.get("/storage/tweets/:id", async (c) => {
  const id = c.req.param("id");
  const tweet = await new R2TweetsStorage(c.env).getTweetByID(id);
  return c.json(tweet);
});

app.post("/storage/re-save", async (c) => {
  const body = await c.req.json();
  const { ids, run_ai_analyze = false } = body;
  if (!ids) return c.json({ error: "ids are required" }, 400);
  const tweets: SavedTweet[] = [];
  for (const id of ids) {
    const tweet = await new R2TweetsStorage(c.env).getTweetDataByID(id);
    if (!tweet) {
      return c.json({ error: `Tweet ${id} not found` }, 404);
    }
    if (run_ai_analyze) {
      const { aiAnalyzedData } = await aiAnalyze(tweet, c.env);
      tweet.aiAnalyzedData = aiAnalyzedData;
    }
    tweets.push({ ...tweet });
  }
  await saveTweets(tweets, c.env);
  return c.json({ status: "success", run_ai_analyze, count: tweets.length, tweets });
});

app.post("/ai/tweet/:id", async (c) => {
  const id = c.req.param("id");
  const fullTweetData = await new R2TweetsStorage(c.env).getRawFullTweetDataByID(id);
  if (!fullTweetData) {
    return c.json({ error: `Tweet ${id} not found` }, 404);
  }
  const result = await aiAnalyze({ fullTweetData }, c.env);
  return c.json(result);
});

// get all scrape requests from KV
app.get("/scrape", async (c) => {
  const kv = c.env.SCRAPE_REQUESTS_KV;
  const list = await kv.list();
  const scrapeRequests = await Promise.all(
    list.keys.map(async (key) => {
      const scrapeRequest = await kv.get(key.name);
      return {
        scrapeRequestId: key.name,
        scrapeRequest,
      };
    })
  );
  return c.json(scrapeRequests);
});

app.get("/scrape/:scrapeRequestId", async (c) => {
  const scrapeRequestId = c.req.param("scrapeRequestId");
  // const stub = await getScrapeRequestDO(c.env, scrapeRequestId);
  const objectScrapeID = c.env.SCRAPE_REQUESTS.idFromString(scrapeRequestId);
  const stub = c.env.SCRAPE_REQUESTS.get(objectScrapeID);

  console.log(stub);
  // const scrapeRequest = await stub.startedScraping();
  const scrapeRequest = await stub.getData();
  return c.json(scrapeRequest);
});

app.post("/scrape/:userId", async (c) => {
  const userId = c.req.param("userId");

  const id = await c.env.SCRAPE_REQUESTS.newUniqueId();
  const stub = c.env.SCRAPE_REQUESTS.get(id);
  const scrapeRequestId = id.toString();

  const scrapeRequest: TweetsScraperBody = {
    scrapeRequestId,
    scrapeRequest: "user",
    config: { userId },
  };

  await stub.startNewScrape(scrapeRequest);
  return c.json({ scrapeRequestId });
});

// app.get("/scrape/:userId", async (c) => {
//   const userId = c.req.param("userId");
//   // from:samecwilliams until:2024-06-10
//   const getOlder = c.req.query("getOlder") == "true";

//   // Every unique ID refers to an individual instance of the Durable Object class
//   const id = c.env.XHANDLES.idFromName(userId);
//   // A stub is a client used to invoke methods on the Durable Object
//   const stub = c.env.XHANDLES.get(id);

//   const existingUser = (await stub.getUser(userId)) as XHandle;
//   if (existingUser && !getOlder) {
//     return c.json({ user: existingUser });
//   }

//   const { fullTweetData, parsedTweetData, userInfo } = await new Scraper(c.env).scrapeUserTweets(userId, {
//     until: getOlder ? existingUser?.metadata.oldestTweetAt : undefined,
//   });
//   console.log(parsedTweetData);
//   // await new TypesenseClient(c.env).upsertTweets(parsedTweetData);

//   // const sortedTweets = parsedTweetData.sort((a, b) => a.created_at - b.created_at);
//   // // Methods on the Durable Object are invoked via the stub
//   // await stub.upsertUser(userInfo, {
//   //   lastScrapedAt: Date.now(),
//   //   oldestTweetAt: sortedTweets[0].created_at,
//   //   latestTweetAt: sortedTweets[sortedTweets.length - 1].created_at,
//   // });

//   // const user = await stub.getUser(userId);

//   return c.json({
//     // user,
//     // tweets,
//   });
// });

app.get("/search/:query", async (c) => {
  const query = c.req.param("query");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const fromParam = from ? parseInt(from) : undefined;
  const toParam = to ? parseInt(to) : undefined;

  const results = await new TypesenseClient(c.env).search(query, { from: fromParam, to: toParam });
  return c.json(results);
});

app.get("/query/:query", async (c) => {
  const query = c.req.param("query");
  const results = await new PineconeClient(c.env).query(query, PineconeNamespace.TWEETS);
  return c.json(results);
});

app.get("/user/:handle", async (c) => {
  const handle = c.req.param("handle");
  const xHandleDO = getXHandleDO(c.env, handle);
  const user = await xHandleDO.getUser();
  return c.json(user);
});

app.delete("/user/:handle", async (c) => {
  const handle = c.req.param("handle");
  const xHandleDO = getXHandleDO(c.env, handle);
  await xHandleDO.deleteSelf();
});

app.get("/user/:handle/tweets", async (c) => {
  const handle = c.req.param("handle");
  const xHandleDO = getXHandleDO(c.env, handle);
  const user = await xHandleDO.getTweets();
  return c.json(user);
});

// convert this to a stream
app.get("/search/summary/:query", async (c) => {
  const query = c.req.param("query");
  if (!query) return c.json({ error: "Query is required" }, 400);

  const from = c.req.query("from");
  const to = c.req.query("to");
  const fromParam = from ? parseInt(from) : undefined;
  const toParam = to ? parseInt(to) : undefined;

  const results = await new TypesenseClient(c.env).search(query, { from: fromParam, to: toParam });
  const summary = await new LLM(c.env).summarizeTweets(results);
  if (LLM.hasResponse(summary)) {
    return c.json({ summary: summary.response, prompt: summary, results });
  }
  return c.json({ error: "No result" }, 500);
});
