"use client";

import { useAppStore } from "@/store/useAppStore";
import { Upvotes } from "@/utils/types";
import { Loader2, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toggleTrendCommentLike, toggleTrendLike } from "@/lib/clientActions";

type UpdateLikeButtonProps = {
  initialLikes: number;
  upvotes: Upvotes;
  trendSlug: string;
  date?: string;
  commentId?: string;
  replyId?: string;
};

export default function UpdateLikeButton({ initialLikes, upvotes, trendSlug, commentId, replyId, date }: UpdateLikeButtonProps) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [userLiked, setUserLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // toggleTrendCommentLike({ trend: trendSlug, commentId: comment.id })
  const onClick = async () => {
    if (commentId) {
      // upvote comment on trend and trend day
      await toggleTrendCommentLike({ trend: trendSlug, commentId: commentId, date, replyId });
    } else {
      await toggleTrendLike(trendSlug);
    }
  };

  useEffect(() => {
    if (walletAddressID) {
      if (upvotes) setUserLiked(!!upvotes[walletAddressID]);
    }
  }, [walletAddressID, upvotes]);

  return (
    <Button
      disabled={!walletAddressID || isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          await onClick();
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
      variant={userLiked ? "secondary" : "ghost"}
      size="sm"
      className="gap-2"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
      {likes}
    </Button>
  );
}
