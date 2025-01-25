import CartIcon from "@/icons/cart";
import { ParsedTweetData } from "@/types/tweet";
import { useLocalStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export default function AddTweetToCart({ tweet }: { tweet: ParsedTweetData }) {
  const location = useLocation();
  const { addTweet, removeTweet } = useLocalStore();
  const hasTweet = useLocalStore((state) => state.tweets.some((t) => t.id === tweet.id));

  if (location.pathname !== "/create") {
    return null;
  }
  return (
    <button
      className={cn(
        "shrink-0 w-56 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
        hasTweet ? "bg-red-500 w-56 hover:bg-red-600 focus:ring-red-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
      )}
      onClick={() => {
        if (hasTweet) {
          removeTweet(tweet);
        } else {
          addTweet(tweet);
        }
      }}
    >
      <CartIcon />
      {hasTweet ? "Remove from Snapshot" : "Use in Snapshot"}
    </button>
  );
}
