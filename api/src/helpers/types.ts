export type TrendTopic = string

export interface AiAnalyzedData {
  keyMentions: string[];
  keyHighlight: string;
  trendTopics: TrendTopic[];
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
  createdAt: string;
  retweet?: FullTweetData;
  quote?: FullTweetData;
  text?: string;
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

export type TypesenseTweetData = ParsedTweetData & AiAnalyzedData

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
      urls: any[];
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

