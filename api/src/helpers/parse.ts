import { FullTweetData, Media, ParsedTweetData } from "./types";

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
          variants.find((variant) => variant.content_type === "video/mp4")
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
    if (!tweet?.id) return false;
    if (!seenIds.has(tweet.id)) {
      seenIds.add(tweet.id);
      return true;
    }
    return false;
  });

  const removedRetweets = uniqueTweets.filter((tweet) => !tweet.isRetweet);

  const tweets: ParsedTweetData[] = removedRetweets.map((tweet) => {
    const tweetData: ParsedTweetData = {
      id: tweet.id,
      media: getMedia(tweet),
      like_count: tweet.likeCount,
      user_id: tweet.author.id,
      user_name: tweet.author.userName,
      created_at: new Date(tweet.createdAt).getTime(),
      conversation_id: tweet.conversationId,
      is_reply: !!tweet.isReply,
      is_quote: !!tweet.isQuote,
      // is_sourced_from_retweet: !!tweet.isRetweet,
    };

    // if (tweet.isRetweet && tweet.retweet) {
    //   // if its a retweet, we are going to store the original tweet.
    //   tweetData.sourced_from_retweet_by_tweet_id = tweet.id;
    //   tweetData.sourced_from_retweet_by_user_id = tweet.retweet.author.id;
    //   tweetData.sourced_from_retweet_by_user_name = tweet.retweet.author.userName;
    //   tweetData.id = tweet.retweet.id;
    //   tweetData.media = getMedia(tweet.retweet);
    //   tweetData.like_count = tweet.retweet.likeCount;
    //   tweetData.user_id = tweet.retweet.author.id;
    //   tweetData.user_name = tweet.retweet.author.userName;
    //   // should'nt a retweet have to definitely have text...
    //   if (tweet.retweet.text) tweetData.text = expandUrls(tweet.retweet, tweet.retweet.text);
    //   tweetData.created_at = new Date(tweet.retweet.createdAt).getTime();
    //   // tweetData.conversation_id = tweet.retweet.conversationId; // not there for tweets sourced from retweets
    //   tweetData.is_reply = false;
    //   tweetData.is_quote = false;
    // } else {
    if (tweet.isReply && tweet.inReplyToId) {
      tweetData.reply_to_tweet_id = tweet.inReplyToId;
      tweetData.reply_to_user_id = tweet.inReplyToUserId;
      tweetData.reply_to_user_name = tweet.inReplyToUsername;
    }
    tweetData.text = expandUrls(tweet, tweet.text ?? "");

    if (tweet.isQuote && tweet.quote) {
      tweetData.quote = expandUrls(tweet.quote, tweet.quote.text!);
      tweetData.quote_media = getMedia(tweet.quote);
      tweetData.quote_tweet_id = tweet.quote.id;
      tweetData.quote_user_id = tweet.quote.author.id;
      tweetData.quote_user_name = tweet.quote.author.userName;
      // }
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

  return tweets;
};

// export const parseUserInfo = (data: FullTweetData[], userHandle: string): XUserInfo => {
//   const userInfo = data.find((tweet) => tweet.author.userName === userHandle)?.author;
//   if (!userInfo) {
//     throw new Error("User info not found");
//   }
//   return userInfo;
// };
