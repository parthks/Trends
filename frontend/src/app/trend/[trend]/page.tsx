import CommunityTimeline from "@/components/TrendPage";
import TweetCard from "@/components/TweetCard";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";

export default async function TrendPage({ params }: { params: { trend: string } }) {
  const data = await sendDryRunGameMessage<Trend>({
    tags: [
      { name: "Action", value: "GetTrend" },
      {
        name: "Trend",
        value: params.trend,
      },
    ],
  });

  const trendData = data.data;
  console.log(trendData);
  const tweetId = trendData.byDay["2024-02-13"].tweets[0].id;

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
