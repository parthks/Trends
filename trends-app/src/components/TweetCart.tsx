import { useLocalStore } from "@/lib/store";
// import ClientTweetCard from "./ClientTweetCard";
import { Tweet } from "react-tweet";
import LazyLoadContent from "./LazyLoadContent";
import { useState } from "react";

export default function TweetCart() {
  const tweets = useLocalStore((state) => state.tweets);
  const [search, setSearch] = useState("");
  const { removeAllTweets, removeTweet } = useLocalStore();

  console.log("tweets in cart", tweets);

  const filteredTweets = tweets.filter((tweet) => {
    const isTextMatch = tweet.text?.toLowerCase().includes(search.toLowerCase());
    const isQuoteMatch = tweet.quote?.toLowerCase().includes(search.toLowerCase());
    const isUserMatch = tweet.user_name?.toLowerCase().includes(search.toLowerCase());
    return isTextMatch || isQuoteMatch || isUserMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tweet Cart</h2>
        <button className="text-sm text-red-500" onClick={() => removeAllTweets()}>
          Remove All
        </button>
      </div>

      <div className="flex flex-col mt-4">
        <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
        {<p className="text-sm text-gray-500">Displaying {filteredTweets.length} tweets</p>}
      </div>

      <div className="flex flex-col gap-4">
        <LazyLoadContent
          scrollDirection="vertical"
          dataArray={filteredTweets}
          renderItem={(tweet) => (
            <div key={tweet.id} className="flex-grow">
              <div className="relative w-full flex gap-2">
                <div className="min-h-[200px]">
                  <Tweet id={tweet.id} />
                </div>
                <button className="text-sm text-red-500 hover:text-red-700" onClick={() => removeTweet(tweet)}>
                  Remove
                </button>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
