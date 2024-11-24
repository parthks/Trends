"use client";

import { toggleTrendLike } from "@/lib/clientActions";
import { Upvotes } from "@/utils/types";
import { ThumbsUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAppStore } from "@/store/useAppStore";

export default function TrendLikeButton({ initialLikes, trend, upvotes }: { initialLikes: number; trend: string; upvotes: Upvotes }) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (walletAddressID) {
      setUserLiked(!!upvotes[walletAddressID]);
    }
  }, [walletAddressID, upvotes]);

  return (
    <>
      <Button
        disabled={!walletAddressID || isLoading}
        onClick={async () => {
          setIsLoading(true);
          try {
            await toggleTrendLike(trend);
            if (userLiked) {
              setLikes((likes) => likes - 1);
            } else {
              setLikes((likes) => likes + 1);
            }
            setUserLiked(!userLiked);
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        }}
        variant={userLiked ? "secondary" : "outline"}
        className="gap-2"
      >
        <ThumbsUp className="w-4 h-4" />
        {likes} upvotes
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </Button>
    </>
  );
}
