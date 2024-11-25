"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Comments } from "@/utils/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { addTrendComment } from "@/lib/clientActions";
import TimeAgoText from "../TimeAgoTex";
import UpdateLikeButton from "./UpdateLikeButton";
import { useAppStore } from "@/store/useAppStore";
import { IconMessageCircle } from "@tabler/icons-react";
// import emojiData from "@emoji-mart/data";

type CommentsProps = {
  initialComments: Comments;
  trendSlug: string;
};

export default function TrendComments({ initialComments, trendSlug }: CommentsProps) {
  const [comments, setComments] = useState(initialComments);

  //   sort comments by created_at
  const sortedComments = Object.entries(comments).sort((a, b) => new Date(b[1].created_at).getTime() - new Date(a[1].created_at).getTime());
  return (
    <div>
      <CommentInput setComments={setComments} trendSlug={trendSlug} />
      {sortedComments.map(([key, comment]) => (
        <Comment setComments={setComments} trendSlug={trendSlug} comment={comment} key={key} />
      ))}
    </div>
  );
}

function CommentInput({ trendSlug, setComments }: { trendSlug: string; setComments: Dispatch<SetStateAction<Comments>> }) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  // const [emojiSearch, setEmojiSearch] = useState('');
  // const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);
  // const [cursorPosition, setCursorPosition] = useState(0);

  // // Filter emojis based on search
  // const filteredEmojis = emojiSearch
  //   ? Object.values(emojiData.emojis).filter((emoji: any) =>
  //       emoji.keywords.some((k: string) => k.includes(emojiSearch.toLowerCase())) ||
  //       emoji.name.includes(emojiSearch.toLowerCase())
  //     ).slice(0, 5)
  //   : [];

  return (
    <div className="flex gap-2 mb-8 relative">
      <Input
        placeholder="Join the board discussion..."
        disabled={!walletAddressID || isLoading}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onFocus={() => setIsFocused(true)}
        // onKeyDown={(e) => {
        //   if (e.key === ":") {
        //     setShowEmojiPicker(true);
        //   }
        // }}
        onBlur={(e) => {
          // Only unfocus if clicking outside both input and button
          if (!e.relatedTarget?.classList.contains("submit-btn")) {
            setIsFocused(false);
          }
        }}
      />
      {(isFocused || isLoading) && (
        <Button
          className="submit-btn"
          disabled={!walletAddressID || isLoading}
          variant="secondary"
          onClick={async () => {
            if (comment.length === 0) return;
            setIsLoading(true);
            const data = await addTrendComment<Comments>(trendSlug, comment);
            setComments(data);
            setComment("");
            setIsLoading(false);
          }}
        >
          {isLoading ? "commenting..." : "comment"}
        </Button>
      )}
    </div>
  );
}

function Comment({ setComments, comment, trendSlug }: { setComments: Dispatch<SetStateAction<Comments>>; comment: Comments[string]; trendSlug: string }) {
  const [isReplying, setIsReplying] = useState(false);
  const replyInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isReplying]);

  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold">{`${comment.from.slice(0, 6)}...${comment.from.slice(-4)}`}</span>
            <span className="h-[2px] w-[2px] bg-muted-foreground rounded-full" />
            <span className="text-sm text-muted-foreground">{<TimeAgoText date={comment.created_at} />}</span>
          </div>
        </div>
        <p className="text-sm">{comment.comment}</p>
        <div className="flex items-center gap-1 text-sm">
          <UpdateLikeButton commentId={comment.id} trendSlug={trendSlug} initialLikes={comment.total_upvotes} upvotes={comment.upvotes} />

          <Button variant="ghost" size="sm" onClick={() => setIsReplying(true)}>
            <IconMessageCircle className="w-4 h-4" />
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
      <div className="pl-12 border-l border-gray-200 dark:border-gray-800">
        {Object.entries(comment.replies).map(([key, reply]) => (
          <Reply commentId={comment.id} setComments={setComments} reply={reply} trendSlug={trendSlug} key={key} />
        ))}
        {isReplying && (
          <div ref={replyInputRef}>
            <ReplyInput setComments={setComments} onClose={() => setIsReplying(false)} commentId={comment.id} trendSlug={trendSlug} />
          </div>
        )}
      </div>
    </div>
  );
}

function Reply({ reply, trendSlug, commentId }: { setComments: Dispatch<SetStateAction<Comments>>; reply: Comments[string]["replies"][0]; trendSlug: string; commentId: string }) {
  return (
    <div className="space-y-2 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold">{`${reply.from.slice(0, 6)}...${reply.from.slice(-4)}`}</span>
          <span className="h-[2px] w-[2px] bg-muted-foreground rounded-full" />
          <span className="text-sm text-muted-foreground">{<TimeAgoText date={reply.created_at} />}</span>
        </div>
      </div>
      <p className="text-sm">{reply.comment}</p>
      <div className="flex items-center gap-4 text-sm">
        <UpdateLikeButton commentId={commentId} replyId={reply.id} trendSlug={trendSlug} initialLikes={reply.total_upvotes} upvotes={reply.upvotes} />
      </div>
    </div>
  );
}

function ReplyInput({
  setComments,
  onClose,
  commentId,
  trendSlug,
}: {
  setComments: Dispatch<SetStateAction<Comments>>;
  onClose: () => void;
  commentId: string;
  trendSlug: string;
}) {
  const walletAddressID = useAppStore((state) => state.walletAddressID);
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState("");

  return (
    <div className="flex gap-2 mt-2">
      <Input placeholder="Write a reply" className="mb-4" disabled={!walletAddressID || isLoading} value={reply} onChange={(e) => setReply(e.target.value)} autoFocus />
      <div className="flex gap-2 mb-4">
        <Button variant="ghost" disabled={isLoading} onClick={onClose}>
          Discard
        </Button>
        <Button
          disabled={!walletAddressID || isLoading}
          variant="secondary"
          onClick={async () => {
            setIsLoading(true);
            const data = await addTrendComment<Comments>(trendSlug, reply, commentId);
            setComments(data);
            setReply("");
            setIsLoading(false);
            onClose();
          }}
        >
          {isLoading ? "replying..." : "reply"}
        </Button>
      </div>
    </div>
  );
}
