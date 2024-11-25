export type TrendPreview = {
  name: string;
  slug: string;
  description: string;
  handles: Record<string, { handle: string; num_tweets: number }>;
  upvotes: Upvotes;
  total_upvotes: number;
  total_views: number;
  last_updated: string;
  num_updates: number;
  followers: Record<string, { created_at: string }>;
  total_followers: number;
  comments: Comments;
};

export type Trend = TrendPreview & {
  byDay: ByDay;
};

type ByDay = {
  [date: string]: TrendUpdate;
};

export type TrendUpdate = {
  summary: string;
  comments: Comments;
  upvotes: Upvotes;
  total_upvotes: number;
  tweets: {
    id: string;
    handle: string;
    total_likes: number;
  }[];
};

export type Upvotes = Record<string, { created_at: string; vote: number }>;

export type Comments = Record<
  string,
  Comment & {
    replies: Replies;
  }
>;

type Replies = Record<string, Comment>;

type Comment = {
  id: string;
  from: string;
  upvotes: Upvotes;
  total_upvotes: number;
  created_at: string;
  comment: string;
};
