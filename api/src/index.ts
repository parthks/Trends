import { Hono } from "hono";
import { Scraper } from "./classes/Apify";
import { LLM } from "./classes/LLM";
import { TypesenseClient } from "./classes/Typesense";
import { XHandle, XHandlesObject } from "./DurableObjects/XHandles";
import { saveTweets, saveTweetsBody } from "./helpers/services";
import { aiAnalyze } from "./helpers/services";
import { tweetsScraper } from "./helpers/services";

export { XHandlesObject };

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.onError(async (err, c) => {
  const error = {
    name: err.name,
    message: err.message,
    cause: err.cause,
    stack: err.stack,
  };
  await c.env.ERROR_QUEUE.send(error)
  return c.json(error, { status: 500 })
})

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: CloudflareBindings) {
    switch(batch.queue) {
      case "error-queue":
        for (const message of batch.messages) {
          const error = message.body as Error
          await env.ERROR_BUCKET.put(`errors/${Date.now()}.log`, JSON.stringify(error))
        }
        break;
      case "tweets-scraper-queue":
        // await tweetsScraper(tweetsData, env);
        break;
      case "ai-analyzer-queue":
        const aiData = batch.messages.map(message => message.body)
        // await aiAnalyze(aiData);
        break;
      case "save-tweets-queue":
        const saveData = batch.messages.map(message => message.body) as saveTweetsBody
        await saveTweets(saveData, env);
        break;
      default:
        console.log("unknown queue", batch.queue);
    }
  },
}

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ai", async (c) => {
  const llmResult = await new LLM(c.env).introduce("introduce yourself");
  if (LLM.hasResponse(llmResult)) {
    return c.text(llmResult.response);
  }
  return c.text("No result");
});

app.get("/scrape/:userId", async (c) => {
  const userId = c.req.param("userId");
  // from:samecwilliams until:2024-06-10
  const getOlder = c.req.query("getOlder") == "true";

  // Every unique ID refers to an individual instance of the Durable Object class
  const id = c.env.XHANDLES.idFromName(userId);
  // A stub is a client used to invoke methods on the Durable Object
  const stub = c.env.XHANDLES.get(id);

  const existingUser = (await stub.getUser(userId)) as XHandle;
  if (existingUser && !getOlder) {
    return c.json({ user: existingUser });
  }

  const { fullTweetData, parsedTweetData, userInfo } = await new Scraper(c.env).scrapeUserTweets(userId, {
    until: getOlder ? existingUser?.metadata.oldestTweetAt : undefined,
  });
  console.log(parsedTweetData);
  // await new TypesenseClient(c.env).upsertTweets(parsedTweetData);

  // const sortedTweets = parsedTweetData.sort((a, b) => a.created_at - b.created_at);
  // // Methods on the Durable Object are invoked via the stub
  // await stub.upsertUser(userInfo, {
  //   lastScrapedAt: Date.now(),
  //   oldestTweetAt: sortedTweets[0].created_at,
  //   latestTweetAt: sortedTweets[sortedTweets.length - 1].created_at,
  // });

  // const user = await stub.getUser(userId);

  return c.json({
    // user,
    // tweets,
  });
});

app.get("/search/:query", async (c) => {
  const query = c.req.param("query");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const fromParam = from ? parseInt(from) : undefined;
  const toParam = to ? parseInt(to) : undefined;

  const results = await new TypesenseClient(c.env).search(query, { from: fromParam, to: toParam });
  return c.json(results);
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