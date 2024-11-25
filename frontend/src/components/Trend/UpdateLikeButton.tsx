"use client";

import { useAppStore } from "@/store/useAppStore";
import { Upvotes } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toggleTrendCommentLike, toggleTrendLike, toggleTrendUpdateLike } from "@/lib/clientActions";
import { IconArrowBadgeUp } from "@tabler/icons-react";

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
    } else if (date) {
      // upvote trend day
      await toggleTrendUpdateLike(trendSlug, date);
    } else {
      // upvote trend
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
      variant={"ghost"}
      size="sm"
      className={`gap-1 font-bold ${userLiked ? "text-secondary hover:text-secondary" : "text-primary hover:text-secondary"}`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IconArrowBadgeUp className={`w-4 h-4`} />}
      {likes}
    </Button>
  );
}
