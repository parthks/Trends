export type TrendPreview = {
  name: string;
  slug: string;
  description: string;
  upvotes: Upvotes;
  total_upvotes: number;
  last_updated: string;
  num_updates: number;
  followers: Record<string, { created_at: string }>;
  total_followers: number;
  comments: Comments;
};

export type Trend = TrendPreview & {
  byDate: ByDate;
};

type ByDate = {
  [date: string]: {
    summary: string;
    comments: Comments;
    upvotes: Upvotes;
    total_upvotes: number;
    tweets: {
      id: string;
      handle: string;
    }[];
  };
};

type Upvotes = Record<string, { created_at: string; vote: number }>;

type Comments = Record<
  string,
  Comment & {
    replies: Replies;
  }
>;

type Replies = Record<string, Comment>;

type Comment = {
  id: string;
  address: string;
  upvotes: Upvotes;
  total_upvotes: number;
  created_at: string;
  comment: string;
};
