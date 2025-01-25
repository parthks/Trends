import { Hono } from "hono";
import { cors } from "hono/cors";
import { LLM } from "./classes/LLM";
import { PineconeClient, PineconeNamespace } from "./classes/Pinecone";
import { R2TweetsStorage } from "./classes/TweetsStorage";
import { TypesenseClient } from "./classes/Typesense";
import { ScrapeRequestsObject, TweetsScraperBody } from "./DurableObjects/ScrapeRequests";
// import { XHandlesObject } from "./DurableObjects/XHandles";
import { parseTweets } from "./helpers/parse";
import { AiAnalyzeBody, aiAnalyze, aiAnalyzeInQueue } from "./helpers/services/aiAnalyzing";
import { SavedTweet, saveTweets } from "./helpers/services/saving";
import { tweetsScraper } from "./helpers/services/scraping";
import { getScrapeRequestDO } from "./helpers/utils";

export { ScrapeRequestsObject };

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.use("*", cors());

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
          const now = Date.now();
          console.error(now, "got app error", error);
          await env.ERROR_BUCKET.put(`errors/${now}.log`, JSON.stringify(error));
        }
        break;
      case "tweets-scraper-queue":
        const scraperData = batch.messages.map((message) => message.body) as TweetsScraperBody[];
        for (const data of scraperData) {
          const stub = getScrapeRequestDO(env, data.scrapeRequestId);
          await stub.startedScraping();
          try {
            await tweetsScraper(data, env);
          } catch (err) {
            console.error(err);
            await stub.failedScraping(err instanceof Error ? err.message : "Unknown error");
          }
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
          await stub.doneSaving(saveData.filter((s) => s.scrapeRequestId === scrapeRequestId).map((s) => s.parsedTweetData.id));
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

app.get("/storage/tweets", async (c) => {
  const tweets = await new R2TweetsStorage(c.env).listTweetIds();
  return c.json(tweets);
});

app.delete("/storage/full-tweets", async (c) => {
  const ids = (await c.req.json()).ids as string[];
  if (!ids) return c.json({ error: "ids are required" }, 400);
  await new R2TweetsStorage(c.env).deleteRawFullTweetDataByIds(ids);
  return c.json({ status: "success" });
});

app.get("/storage/errors", async (c) => {
  const errors = await c.env.ERROR_BUCKET.list();
  // sort by key
  errors.objects.sort((a, b) => b.key.localeCompare(a.key));
  const errorData = await Promise.all(
    errors.objects.map(async (object) => {
      const error = await c.env.ERROR_BUCKET.get(object.key);
      const data = await error?.json();
      return { name: object.key, data };
    })
  );
  return c.json(errorData);
});

app.get("/storage/tweets/:id", async (c) => {
  const id = c.req.param("id");
  const tweet = await new R2TweetsStorage(c.env).getTweetByID(id);
  const fullTweetData = await new R2TweetsStorage(c.env).getRawFullTweetDataByID(id);
  return c.json({ tweet, fullTweetData });
});

app.post("/storage/re-save", async (c) => {
  const body = await c.req.json();
  const { ids, run_ai_analyze = false, all = false } = body;
  if (!ids && !all) return c.json({ error: "ids are required or all must be true" }, 400);
  const tweets: SavedTweet[] = [];
  const allTweetIds = all ? await new R2TweetsStorage(c.env).listRawTweetIds() : ids;
  console.log("re-saving", allTweetIds.length, "tweets");
  for (const id of allTweetIds) {
    console.log("re-saving tweet", id);
    const tweet = ((await new R2TweetsStorage(c.env).getTweetDataByID(id)) ?? {}) as SavedTweet;
    const fullTweetData = await new R2TweetsStorage(c.env).getRawFullTweetDataByID(id);
    if (!fullTweetData) {
      return c.json({ error: `Full tweet ${id} not found` }, 404);
    }
    const parsedTweetData = parseTweets([fullTweetData]);
    tweet.parsedTweetData = parsedTweetData[0];
    if (run_ai_analyze) {
      const { aiAnalyzedData } = await aiAnalyze({ fullTweetData }, c.env);
      tweet.aiAnalyzedData = aiAnalyzedData;
    }
    tweets.push({ ...tweet });
  }

  if (tweets.length === 0) {
    return c.json({ status: "yo, no tweets!!!", run_ai_analyze, count: tweets.length });
  }

  await saveTweets(tweets, c.env);
  return c.json({ status: "success", run_ai_analyze, count: tweets.length, tweets });
});

// get all scrape requests from KV
app.get("/scrape", async (c) => {
  const kv = c.env.SCRAPE_REQUESTS_KV;
  const list = await kv.list();
  const scrapeRequests = await Promise.all(
    list.keys.map(async (key) => {
      console.log("Getting scrape request: " + key.name);
      const requestData = await kv.get(key.name);
      return {
        scrapeRequestId: key.name,
        data: JSON.parse(requestData ?? "{}"),
      };
    })
  );
  // sort based on scrapeRequestDate
  scrapeRequests.sort((a, b) => (b.data?.scrapeRequestDate ?? 0) - (a.data?.scrapeRequestDate ?? 0));
  // get only the first 10
  const scrapeRequestData = await Promise.all(
    scrapeRequests.slice(0, 10).map(async (s) => {
      const scrapeRequest = getScrapeRequestDO(c.env, s.scrapeRequestId);
      const data = await scrapeRequest.getData();
      return { ...s, data };
    })
  );

  return c.json(scrapeRequestData);
});

app.delete("/scrape", async (c) => {
  const scrapeRequestId = c.req.query("scrapeRequestId");
  if (scrapeRequestId) {
    const scrapeRequestDO = await getScrapeRequestDO(c.env, scrapeRequestId);
    if (!scrapeRequestDO) return c.json({ error: "Scrape request not found" }, 404);
    await scrapeRequestDO.deleteSelf();
    // await c.env.SCRAPE_REQUESTS_KV.delete(scrapeRequestId);
  } else {
    const scrapeRequests = await c.env.SCRAPE_REQUESTS_KV.list();
    for (const scrapeRequest of scrapeRequests.keys) {
      await c.env.SCRAPE_REQUESTS_KV.delete(scrapeRequest.name);
      const scrapeRequestDO = getScrapeRequestDO(c.env, scrapeRequest.name);
      await scrapeRequestDO.deleteSelf();
    }
  }
  return c.json({ status: "success" });
});

app.get("/scrape/:scrapeRequestId", async (c) => {
  const scrapeRequestId = c.req.param("scrapeRequestId");
  // const stub = await getScrapeRequestDO(c.env, scrapeRequestId);
  const objectScrapeID = c.env.SCRAPE_REQUESTS.idFromString(scrapeRequestId);
  const stub = c.env.SCRAPE_REQUESTS.get(objectScrapeID);

  const scrapeRequest = await stub.getData();
  return c.json(scrapeRequest);
});

app.post("/scrape/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const { config = {} } = body;

  const id = await c.env.SCRAPE_REQUESTS.newUniqueId();
  const scrapeRequestId = id.toString();
  const stub = getScrapeRequestDO(c.env, scrapeRequestId);

  const scrapeRequest: TweetsScraperBody = {
    scrapeRequestId,
    scrapeRequest: "user",
    config: { userId, ...config },
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

app.delete("/search", async (c) => {
  // const kv = c.env.XHANDLES_KV;
  // const list = await kv.list();
  // for (const key of list.keys) {
  //   const xHandleDO = getXHandleDO(c.env, key.name);
  //   await xHandleDO.deleteTweets();
  // }
  await new R2TweetsStorage(c.env).deleteAll();
  await new TypesenseClient(c.env).deleteAll();
  await new PineconeClient(c.env).deleteAll();
  return c.json({ status: "success" });
});

app.get("/search", async (c) => {
  const query = c.req.query("query");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const fromParam = from ? parseInt(from) : undefined;
  const toParam = to ? parseInt(to) : undefined;

  const results = await new TypesenseClient(c.env).search(query ?? "", { from: fromParam, to: toParam });
  return c.json(results);
});

app.get("/user", async (c) => {
  const kv = c.env.XHANDLES_KV;
  const list = await kv.list();
  // const users = await Promise.all(
  //   list.keys.map(async (key) => {
  //     const xHandleDO = getXHandleDO(c.env, key.name);
  //     const user = await xHandleDO.getUser();
  //     return { handle: key.name, data: user };
  //   })
  // );
  return c.json(list);
});

app.get("/user/:handle", async (c) => {
  const handle = c.req.param("handle");
  const kv = c.env.XHANDLES_KV;
  const user = await kv.get(handle);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  // const xHandleDO = getXHandleDO(c.env, handle);
  // const user = await xHandleDO.getUser();
  return c.json(user);
});

app.delete("/user/:handle", async (c) => {
  const handle = c.req.param("handle");
  const kv = c.env.XHANDLES_KV;
  await kv.put(handle, "{}");
  // const xHandleDO = getXHandleDO(c.env, handle);
  // await xHandleDO.deleteSelf();
});

// app.get("/user/:handle/tweets", async (c) => {
//   const handle = c.req.param("handle");
//   const xHandleDO = getXHandleDO(c.env, handle);
//   const user = await xHandleDO.getTweets();
//   return c.json(user);
// });

app.post("/ai/tweet/:id", async (c) => {
  const id = c.req.param("id");
  const fullTweetData = await new R2TweetsStorage(c.env).getRawFullTweetDataByID(id);
  if (!fullTweetData) {
    return c.json({ error: `Tweet ${id} not found` }, 404);
  }
  const result = await aiAnalyze({ fullTweetData }, c.env);
  return c.json(result);
});

app.post("/ai/query/context", async (c) => {
  const body = await c.req.json();
  const { prompt, options } = body;
  if (!prompt) return c.json({ error: "Prompt is required" }, 400);
  const results = await new PineconeClient(c.env).query(prompt, PineconeNamespace.TWEETS, options);
  return c.json({ results });
});

app.post("/ai/query", async (c) => {
  const body = await c.req.json();
  const { prompt, options } = body;
  if (!prompt) return c.json({ error: "Prompt is required" }, 400);
  const results = await new PineconeClient(c.env).query(prompt, PineconeNamespace.TWEETS, { ...(options ?? {}), includeMetadata: true });
  console.log("got pinencone results", results);
  const stream = await new LLM(c.env).streamAnswerQuestion(prompt, results.map((hit) => hit.text).join("\n"));
  console.log("got llm stream", stream);
  return stream.toDataStreamResponse({
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
  // return c.json({ response: aiAnswer, context: results });
});

app.get("/ai", async (c) => {
  const llmResult = await new LLM(c.env).introduce("introduce yourself");
  // if (LLM.hasResponse(llmResult) && llmResult.response) {
  //   return c.text(llmResult.response);
  // }
  return c.json({ result: llmResult });
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
  if (!results.hits) return c.json({ error: "No result" }, 500);
  const summary = await new LLM(c.env).summarizeTweets(results.hits.map((hit) => hit.document));
  if (LLM.hasResponse(summary)) {
    return c.json({ summary: summary.response, prompt: summary, results });
  }
  return c.json({ error: "No result" }, 500);
});
