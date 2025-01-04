import { FullTweetData, Media, ParsedTweetData, XUserInfo } from "./types";

const expandUrls = (tweet: FullTweetData, text: string): string => {
  const urls: Record<string, string> = {};
  if (tweet.entities.urls.length > 0) {
    tweet.entities.urls.forEach((urlData) => {
      urls[urlData.url] = urlData.expanded_url;
    });
  }

  Object.entries(urls).forEach(([url, expandedUrl]) => {
    text = text.replace(url, expandedUrl);
  });
  return text;
};

const getMedia = (tweet: FullTweetData): Media[] => {
  const media: Media[] = [];
  if (tweet.entities.media) {
    tweet.entities.media.forEach((mediaData) => {
      if ("video_info" in mediaData) {
        const variants = mediaData.video_info!.variants;
        // find the highest bitrate video and content_type = 'video/mp4'
        const highestBitrateVideo = variants.reduce(
          (max, variant) => (variant.content_type === "video/mp4" && (!max || variant.bitrate > max.bitrate) ? variant : max),
          variants[0]
        );

        if (highestBitrateVideo) {
          media.push({
            original_url: mediaData.url,
            url: highestBitrateVideo.url,
            thumbnail_url: mediaData.media_url_https,
            type: mediaData.type,
          });
        }
      } else {
        media.push({
          original_url: mediaData.url,
          url: mediaData.media_url_https,
          type: mediaData.type,
        });
      }
    });
  }
  return media;
};

export const parseTweets = (data: FullTweetData[]): ParsedTweetData[] => {
  // remove duplicate id
  const seenIds = new Set<string>();
  const uniqueTweets = data.filter((tweet) => {
    if (!seenIds.has(tweet.id)) {
      seenIds.add(tweet.id);
      return true;
    }
    return false;
  });

  const tweets: ParsedTweetData[] = uniqueTweets.map((tweet) => {
    const tweetData: ParsedTweetData = {
      media: getMedia(tweet),
      id: tweet.id,
      like_count: tweet.likeCount,
      user: tweet.author.userName,
      created_at: new Date(tweet.createdAt).getTime(),
    };

    if (tweet.conversationId !== tweet.id) {
      tweetData.conversation_id = tweet.conversationId;
    }

    if (tweet.retweet) {
      tweetData.retweet = expandUrls(tweet.retweet, tweet.retweet.text!);
      tweetData.original_tweet_id = tweet.retweet.id;
      tweetData.retweet_user = tweet.retweet.author.userName;
    } else {
      tweetData.text = expandUrls(tweet, tweet.fullText);
    }

    if (tweet.quote) {
      tweetData.quote = expandUrls(tweet.quote, tweet.quote.text!);
      tweetData.quote_media = getMedia(tweet.quote);
      tweetData.quote_id = tweet.quote.id;
      tweetData.quote_user = tweet.quote.author.userName;
    }

    return tweetData;
  });

  // Create a dictionary to store conversations
  const conversations: Record<string, ParsedTweetData[]> = {};

  // First pass: Organize tweets into conversations
  tweets.forEach((tweet) => {
    if (tweet.conversation_id) {
      if (!conversations[tweet.conversation_id]) {
        conversations[tweet.conversation_id] = [];
      }
      conversations[tweet.conversation_id].push(tweet);
    }
  });

  // Second pass: Add replies to their parent tweets and remove them from the main list
  return tweets.filter((tweet) => {
    if (conversations[tweet.id]) {
      // This tweet has replies
      // Sort conversations by createdAt date
      tweet.thread = conversations[tweet.id].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // combine the media of the tweet and the thread
      const threadMedia = tweet.thread.flatMap((t) => t.media);
      const quoteMedia = tweet.thread.flatMap((t) => t.quote_media || []);
      tweet.media = [...tweet.media, ...threadMedia, ...quoteMedia];

      // combine the text of the tweet and the thread
      if (tweet.text) {
        tweet.text = [tweet.text, ...tweet.thread.map((t) => t.text)].filter(Boolean).join(". ");
      }

      // Keep the parent tweet
      return true;
    }
    // Remove reply tweets
    return !tweet.conversation_id;
  });
};

export const parseUserInfo = (data: FullTweetData[], userHandle: string): XUserInfo => {
  const userInfo = data.find((tweet) => tweet.author.userName === userHandle)?.author;
  if (!userInfo) {
    throw new Error("User info not found");
  }
  return userInfo;
};
