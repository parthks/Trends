import Typesense, { Client } from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { TweetData } from "../helpers/types";

export class SearchClient {
  private client: Client;

  constructor(binding: CloudflareBindings) {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: "yic0jokl7s3quw65p-1.a1.typesense.net",
          port: 443,
          protocol: "https",
        },
      ],
      apiKey: binding.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 5,
    });
  }

  async search(query: string, filter?: { from?: number; to?: number }) {
    const searchParameters: SearchParams = {
      q: query,
      query_by: "text, quote, retweet ",
      sort_by: "_text_match:desc,created_at:desc",
      per_page: 250,
    };

    if (filter && Object.keys(filter).length > 0) {
      const createdAtFilter = [];
      if (filter.from) createdAtFilter.push(`>=${filter.from}`);
      if (filter.to) createdAtFilter.push(`<=${filter.to}`);
      searchParameters.filter_by = `created_at:${createdAtFilter.toString()}`;
    }

    const searchResults = await this.client.collections<TweetData>("tweets").documents().search(searchParameters);

    if (!searchResults.hits) return [];
    const searchDocuments = searchResults.hits.map((hit) => hit.document);

    return searchDocuments;
  }

  async upsertTweets(tweets: TweetData[]) {
    if (tweets.length === 0) {
      console.log("No tweets to upsert");
      return;
    }
    const results = await this.client.collections<TweetData>("tweets").documents().import(tweets, {
      action: "upsert",
    });
    const failedTweets = results.filter((tweet) => tweet.success != true);
    if (failedTweets.length > 0) {
      throw new Error("Failed to upsert some tweets");
    }
  }
}
