"use client";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Comments } from "@/utils/types";
import { Dispatch, SetStateAction, useState } from "react";
import { addTrendComment } from "@/lib/clientActions";
import TimeAgoText from "../TimeAgoTex";
import UpdateLikeButton from "./UpdateLikeButton";
import { useAppStore } from "@/store/useAppStore";

type CommentsProps = {
  initialComments: Comments;
  trendSlug: string;
};

export default function TrendComments({ initialComments, trendSlug }: CommentsProps) {
  const [comments, setComments] = useState(initialComments);

  //   sort comments by created_at
  const sortedComments = Object.entries(comments).sort((a, b) => new Date(b[1].created_at).getTime() - new Date(a[1].created_at).getTime());
  return (
    <Card className="p-4">
      <CommentInput setComments={setComments} trendSlug={trendSlug} />
      {sortedComments.map(([key, comment]) => (
        <Comment trendSlug={trendSlug} comment={comment} key={key} />
      ))}
    </Card>
  );
}

function CommentInput({ trendSlug, setComments }: { trendSlug: string; setComments: Dispatch<SetStateAction<Comments>> }) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add a comment"
        className="mb-4"
        disabled={!walletAddressID || isLoading}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Only unfocus if clicking outside both input and button
          if (!e.relatedTarget?.classList.contains("submit-btn")) {
            setIsFocused(false);
          }
        }}
      />
      {isFocused && (
        <Button
          disabled={!walletAddressID || isLoading}
          className="mb-4 submit-btn"
          onClick={async () => {
            setIsLoading(true);
            const data = await addTrendComment<Comments>(trendSlug, comment);
            setComments(data);
            setComment("");
            setIsLoading(false);
          }}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  );
}

function Comment({ comment, trendSlug }: { comment: Comments[string]; trendSlug: string }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.address}</span>
            <span className="text-sm text-muted-foreground">{<TimeAgoText date={comment.created_at} />}</span>
          </div>
        </div>
        <p>{comment.comment}</p>
        <div className="flex items-center gap-4 text-sm">
          <UpdateLikeButton commentId={comment.id} trendSlug={trendSlug} initialLikes={comment.total_upvotes} upvotes={comment.upvotes} />

          <Button variant="ghost" size="sm">
            reply
          </Button>
          {/* <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            share
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Flag className="w-4 h-4" />
            report
          </Button> */}
        </div>
      </div>
    </div>
  );
}
