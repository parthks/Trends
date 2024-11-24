import CommunityTimeline from "@/components/TrendPage";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";

export default async function TrendPage({ params }: { params: { trend: string } }) {
  const { trend } = await params;
  const data = await sendDryRunGameMessage<Trend>({
    tags: [
      { name: "Action", value: "GetTrend" },
      {
        name: "Trend",
        value: trend,
      },
    ],
  });

  const trendData = data.data;
  //   console.log(trendData);

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
