"use client";

import { toggleTrendLike, updateViewCount } from "@/lib/clientActions";
import { useAppStore } from "@/store/useAppStore";
import { Upvotes } from "@/utils/types";
import { IconArrowBadgeUp } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function TrendLikeButton({ initialLikes, trend, upvotes }: { initialLikes: number; trend: string; upvotes: Upvotes }) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (trend) {
      console.log("updating view count");
      updateViewCount(trend);
    }
  }, [trend]);

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
        variant={"ghost"}
        className={`gap-1 font-bold ${userLiked ? "text-secondary hover:text-secondary" : "text-primary hover:text-primary"}`}
      >
        <IconArrowBadgeUp className={`w-4 h-4 ${userLiked ? "text-secondary" : "text-primary"}`} />
        {likes} upvotes
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </Button>
    </>
  );
}
