import CommunityTimeline from "@/components/TrendPage";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ trend: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const trend = (await params).trend;
  const trends = {
    "ecosystem-projects": {
      title: "Ecosystem Projects",
      description: "Explore the latest projects shaping the blockchain ecosystem.",
    },
    "community-events": {
      title: "Community Events",
      description: "Discover upcoming community events and meetups.",
    },
    "knowledge-sharing": {
      title: "Knowledge Sharing",
      description: "Explore the latest knowledge sharing opportunities.",
    },
    "technical-innovations": {
      title: "Technical Innovations",
      description: "Discover the latest technical innovations in the blockchain space.",
    },
    "market-and-adoption-trends": {
      title: "Market and Adoption Trends",
      description: "Explore the latest market and adoption trends in the blockchain space.",
    },
    "developer-resources": {
      title: "Developer Resources",
      description: "Explore the latest developer resources in the blockchain space.",
    },
    "for-investors-and-enthusiasts": {
      title: "For Investors and Enthusiasts",
      description: "Explore the latest for investors and enthusiasts in the blockchain space.",
    },
    "for-enterprises": {
      title: "For Enterprises",
      description: "Explore the latest for enterprises in the blockchain space.",
    },
    "dao-governance-updates": {
      title: "DAO Governance Updates",
      description: "Explore the latest DAO governance updates.",
    },
    "community-stories": {
      title: "Community Stories",
      description: "Explore the latest community stories.",
    },
    "art-and-nfts": {
      title: "Art and NFTs",
      description: "Explore the latest art and NFTs in the blockchain space.",
    },
    "gaming-on-blockchain": {
      title: "Gaming on Blockchain",
      description: "Explore the latest gaming on blockchain.",
    },
    "sustainability-and-impact": {
      title: "Sustainability and Impact",
      description: "Explore the latest sustainability and impact in the blockchain space.",
    },
    "future-of-blockchain": {
      title: "Future of Blockchain",
      description: "Explore the latest future of blockchain.",
    },
    "education-and-onboarding": {
      title: "Education and Onboarding",
      description: "Explore the latest education and onboarding opportunities in the blockchain space.",
    },
  };

  return {
    title: trends[trend as keyof typeof trends]?.title ?? "Explore Trends",
    description: trends[trend as keyof typeof trends]?.description ?? "Explore the latest trends in the blockchain space.",
    openGraph: {
      images: ["/some-specific-page-image.jpg"],
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
  //   console.log(trendData);

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
