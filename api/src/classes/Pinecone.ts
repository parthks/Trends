import { Index, Pinecone } from "@pinecone-database/pinecone";

type PineconeRecordMetadata = {
  text: string;
  scrapeRequestId?: string;
  user?: string;
  keyMentions?: string[];
  trendTopics?: string[];
};

export type InputPineconeRecordMetadata = Omit<PineconeRecordMetadata, "text">;

export type QueryTweetsOutput = {
  tweet_id: string;
  score: number | undefined;
  text: string;
  metadata: InputPineconeRecordMetadata;
};

type InputPineconeTweetData = {
  tweet_id: string;
  text: string;
  metadata: InputPineconeRecordMetadata;
};

type InputPineconeAIData = {
  tweet_id: string;
  text: string;
  metadata: InputPineconeRecordMetadata;
};

export enum PineconeNamespace {
  TWEETS = "tweets",
  AI_HIGHLIGHTS = "ai-highlights",
}

export class PineconeClient {
  private client: Pinecone;
  private index: Index<PineconeRecordMetadata>;

  // Convert the text into numerical vectors that Pinecone can index
  private model = "multilingual-e5-large";
  private indexName = "tweets";

  constructor(binding: CloudflareBindings) {
    this.client = new Pinecone({
      apiKey: binding.PINECONE_API_KEY,
    });
    this.index = this.client.index(this.indexName);
  }

  async ingestTweetData(data: InputPineconeTweetData[]) {
    await this.ingestData(data, PineconeNamespace.TWEETS);
  }

  async ingestAiHighlightsData(data: InputPineconeAIData[]) {
    await this.ingestData(data, PineconeNamespace.AI_HIGHLIGHTS);
  }

  private async ingestData(data: InputPineconeTweetData[], namespace: PineconeNamespace) {
    const embeddings = await this.client.inference.embed(
      this.model,
      data.map((d) => d.text),
      { inputType: "passage", truncate: "END" }
    );

    if (!embeddings) {
      throw new Error("Failed to embed data");
    }
    if (embeddings.length !== data.length) {
      throw new Error("Mismatch between data and embeddings");
    }
    // check if all embeddings have values
    if (embeddings.some((e) => !e.values)) {
      throw new Error("Some embeddings are undefined");
    }

    const records = data.map((d, i) => ({
      id: d.tweet_id,
      values: embeddings[i].values!,
      metadata: { text: d.text, ...d.metadata },
    }));
    await this.index.namespace(namespace).upsert(records);
  }

  async query(query: string, namespace: PineconeNamespace): Promise<QueryTweetsOutput[]> {
    // Convert the query into a numerical vector that Pinecone can search with
    const queryEmbedding = await this.client.inference.embed(this.model, [query], { inputType: "query" });

    if (!queryEmbedding || !queryEmbedding[0].values) {
      throw new Error("Failed to embed query");
    }

    const results = await this.index.namespace(namespace).query({
      vector: queryEmbedding[0].values,
      topK: 10,
      includeMetadata: true,
      includeValues: false,
    });

    return results.matches.map((m) => ({
      tweet_id: m.id,
      score: m.score,
      text: m.metadata!.text!,
      metadata: m.metadata!,
    }));
  }
}
