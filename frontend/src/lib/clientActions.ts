import { sendAndReceiveGameMessage } from "@/utils/wallet";

export async function updateViewCount(trend: string) {
  await sendAndReceiveGameMessage({
    tags: [
      { name: "Action", value: "UpdateViewCount" },
      { name: "Trend", value: trend },
    ],
  });
}

export async function toggleTrendLike(trend: string) {
  const data = await sendAndReceiveGameMessage({
    tags: [
      { name: "Action", value: "ToggleUpVoteTrend" },
      { name: "Trend", value: trend },
    ],
  });
  return data.data;
}

export async function toggleTrendUpdateLike(trend: string, date: string) {
  const data = await sendAndReceiveGameMessage({
    tags: [
      { name: "Action", value: "ToggleUpVoteTrendUpdate" },
      { name: "Trend", value: trend },
      { name: "Day", value: date },
    ],
  });
  return data.data;
}

export async function toggleTrendCommentLike({ trend, date, commentId, replyId }: { trend: string; date?: string; commentId: string; replyId?: string }) {
  const tags = [
    { name: "Action", value: "ToggleUpVoteComment" },
    { name: "Trend", value: trend },
    { name: "CommentID", value: commentId },
  ];
  if (date) {
    tags.push({ name: "Day", value: date });
  }
  if (replyId) {
    tags.push({ name: "ReplyID", value: replyId });
  }
  const data = await sendAndReceiveGameMessage({
    tags,
  });
  return data.data;
}

export async function addTrendComment<T>(trend: string, comment: string, commentId?: string) {
  const tags = [
    { name: "Action", value: "AddCommentToTrend" },
    { name: "Trend", value: trend },
    { name: "Comment", value: comment },
  ];
  if (commentId) {
    // for a reply
    tags.push({ name: "CommentID", value: commentId });
  }
  const data = await sendAndReceiveGameMessage<T>({
    tags,
  });
  return data.data;
}
