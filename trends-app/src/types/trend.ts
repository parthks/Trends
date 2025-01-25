import { ParsedTweetData } from "./tweet";

export interface TrendSnapshot {
  id: string;
  title: string;
  description: string;
  data: string;
  tweets: ParsedTweetData[];
  createdAt: string;
}
