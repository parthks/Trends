import CommunityTimeline from "@/components/TrendPage";
import { TREND_CATEGORIES } from "@/utils/constants";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import type { Metadata } from "next";

type Props = {
  params: { trend: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
export const revalidate = 0; // Disable caching for this route segment

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const trend = params.trend;

  // Add null check and default values
  const trendData = TREND_CATEGORIES[trend as keyof typeof TREND_CATEGORIES] ?? {
    title: "Explore Trends",
    description: "Explore the latest trends from around the world.",
    image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
  };

  return {
    title: trendData.title,
    description: trendData.description,
    openGraph: {
      title: trendData.title,
      description: trendData.description,
      images: [trendData.image],
    },
    twitter: {
      card: "summary_large_image",
      title: trendData.title,
      description: trendData.description,
      images: [trendData.image],
    },
  };
}

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
    // "Unknown",
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

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
