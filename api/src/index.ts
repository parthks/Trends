import { Hono } from "hono";
import { Scraper } from "./classes/Apify";
import { LLM } from "./classes/LLM";
import { SearchClient } from "./classes/Typesense";
import { User, UsersObject } from "./DurableObjects/Users";

export { UsersObject };

const app = new Hono<{ Bindings: CloudflareBindings }>();

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
  const id = c.env.USERS.idFromName(userId);
  // A stub is a client used to invoke methods on the Durable Object
  const stub = c.env.USERS.get(id);
  const existingUser = (await stub.getUser(userId)) as User;
  if (existingUser && !getOlder) {
    return c.json({ user: existingUser });
  }

  const { tweets, userInfo } = await new Scraper(c.env).scrapeUserTweets(userId, {
    since: getOlder ? existingUser?.metadata.oldestTweetAt : undefined,
  });
  console.log(tweets);
  await new SearchClient(c.env).upsertTweets(tweets);

  const sortedTweets = tweets.sort((a, b) => a.created_at - b.created_at);
  // Methods on the Durable Object are invoked via the stub
  await stub.upsertUser(userInfo, {
    lastScrapedAt: Date.now(),
    oldestTweetAt: sortedTweets[0].created_at,
    latestTweetAt: sortedTweets[sortedTweets.length - 1].created_at,
  });

  const user = await stub.getUser(userId);

  return c.json({
    user,
    tweets,
  });
});

app.get("/search/:query", async (c) => {
  const query = c.req.param("query");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const fromParam = from ? parseInt(from) : undefined;
  const toParam = to ? parseInt(to) : undefined;

  const results = await new SearchClient(c.env).search(query, { from: fromParam, to: toParam });
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

  const results = await new SearchClient(c.env).search(query, { from: fromParam, to: toParam });
  const summary = await new LLM(c.env).summarizeTweets(results);
  if (LLM.hasResponse(summary)) {
    return c.json({ summary: summary.response, prompt: summary, results });
  }
  return c.json({ error: "No result" }, 500);
});

export default app;
