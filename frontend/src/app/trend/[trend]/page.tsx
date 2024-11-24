import CommunityTimeline from "@/components/TrendPage";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";

export async function generateStaticParams() {
  const topics = [
    "Ecosystem Projects",
    "Community Events",
    "Knowledge Sharing",
    "Technical Innovations",
    "Market and Adoption Trends",
    "Developer Resources",
    "For Investors and Enthusiasts",
    "For Enterprises",
    "DAO Governance Updates",
    "Community Stories",
    "Art and NFTs",
    "Gaming on Blockchain",
    "Sustainability and Impact",
    "Future of Blockchain",
    "Education and Onboarding",
    "Unknown",
  ];
  // slug = tag.replace(" ", "-").lower()
  return topics.map((topic) => ({ trend: topic.replace(/\s+/g, "-").toLowerCase() }));
}

export default async function TrendPage({ params }: { params: Promise<{ trend: string }> }) {
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
