import Typesense, { Client } from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { ParsedTweetData, TypesenseTweetData } from "../helpers/types";
import { ImportError } from "typesense/lib/Typesense/Errors";

export class TypesenseClient {
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
      query_by: "text, quote, retweet, user, quote_user, keyTopics, keyEntities",
      sort_by: "_text_match:desc,created_at:desc",
      per_page: 250,
      facet_by: "keyTopics,keyEntities,keyUsers",
    };

    if (filter && (filter.from || filter.to)) {
      const createdAtFilter = [];
      if (filter.from) createdAtFilter.push(`>=${filter.from}`);
      if (filter.to) createdAtFilter.push(`<=${filter.to}`);
      searchParameters.filter_by = `created_at:${createdAtFilter.toString()}`;
    }

    console.log(filter);

    const searchResults = await this.client.collections<ParsedTweetData>("tweets").documents().search(searchParameters);

    return searchResults;
  }

  async upsertTweets(tweets: TypesenseTweetData[]) {
    if (tweets.length === 0) {
      console.log("No tweets to upsert");
      return;
    }
    try {
      const results = await this.client.collections<TypesenseTweetData>("tweets").documents().import(tweets, {
        action: "upsert",
      });
      return results;
    } catch (error) {
      const importError = error as ImportError;
      console.error("Error upserting tweets", importError.importResults);
      if (importError.importResults) {
        throw new Error("Failed to upsert some tweets", {
          cause: importError.importResults,
        });
      }
      throw error;
    }
  }

  async deleteAll() {
    await this.client.collections("tweets").documents().delete({
      filter_by: "scrapeRequestId:!=null",
    });
  }
}
