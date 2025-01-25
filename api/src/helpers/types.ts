// these types are duplicated in the frontend in trends-app

export type TrendTopic = string;

export interface AiAnalyzedData {
  keyUsers: string[];
  keyTopics: string[];
  keyEntities: string[];
  keyHighlight: string;
}

export interface FullTweetData {
  id: string;
  entities: {
    urls: UrlEntity[];
    media?: MediaEntity[];
  };
  author: XUserInfo;
  likeCount: number;
  conversationId: string;
  fullText: string;
  text: string;
  createdAt: string;
  retweet?: FullTweetData;
  quote?: FullTweetData;
  inReplyToId?: string;
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  isRetweet: boolean;
  isQuote: boolean;
  isReply: boolean;
}

interface UrlEntity {
  url: string;
  expanded_url: string;
}

interface MediaEntity {
  url: string;
  media_url_https: string;
  type: string;
  video_info?: {
    variants: VideoVariant[];
  };
}

interface VideoVariant {
  bitrate: number;
  content_type: string;
  url: string;
}
export interface ParsedTweetData {
  id: string;
  media: Media[];
  like_count: number;
  user_id: string;
  user_name: string;
  conversation_id?: string; // not there for tweets sourced from retweets
  created_at: number;
  is_reply: boolean;
  is_quote: boolean;
  // is_sourced_from_retweet: boolean;
  text?: string;
  // sourced_from_retweet_by_user_id?: string;
  // sourced_from_retweet_by_user_name?: string;
  // sourced_from_retweet_by_tweet_id?: string;
  quote?: string;
  quote_media?: Media[];
  quote_tweet_id?: string;
  quote_user_id?: string;
  quote_user_name?: string;
  reply_to_tweet_id?: string;
  reply_to_user_id?: string;
  reply_to_user_name?: string;
}

export type TypesenseTweetData = ParsedTweetData &
  AiAnalyzedData & {
    scrapeRequestId?: string;
  };

export interface Media {
  original_url: string;
  url: string;
  thumbnail_url?: string;
  type: string;
}

export interface XUserInfo {
  type: string;
  userName: string;
  url: string;
  twitterUrl: string;
  id: string;
  name: string;
  isVerified: boolean;
  isBlueVerified: boolean;
  profilePicture: string;
  coverPicture: string;
  description: string;
  location: string;
  followers: number;
  following: number;
  status: string;
  canDm: boolean;
  canMediaTag: boolean;
  createdAt: string;
  entities: {
    description: {
      urls: UrlEntity[];
    };
    url: {
      urls: {
        display_url: string;
        expanded_url: string;
        url: string;
        indices: number[];
      }[];
    };
  };
}

export interface TrendSnapshot {
  id: string;
  title: string;
  description: string;
  data: string;
  tweets: ParsedTweetData[];
  createdAt: Date;
}
