export type TypesenseTweetData = ParsedTweetData & AiAnalyzedData;

interface AiAnalyzedData {
  keyUsers: string[];
  keyTopics: string[];
  keyEntities: string[];
  keyHighlight: string;
}
interface ParsedTweetData {
  id: string;
  media: Media[];
  like_count: number;
  user: string;
  conversation_id?: string;
  retweet?: string;
  original_tweet_id?: string;
  retweet_user?: string;
  text?: string;
  created_at: number;
  quote?: string;
  quote_media?: Media[];
  quote_id?: string;
  quote_user?: string;
  thread?: ParsedTweetData[];
}
interface Media {
  original_url: string;
  url: string;
  thumbnail_url?: string;
  type: string;
}
