"use client";

import GenericTrendCard from "@/components/TrendPreviewCard";
import { TrendPreview } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import { useEffect, useState } from "react";
import Loading from "./loading";
import Link from "next/link";
import { IconTrendingUp } from "@tabler/icons-react";

// export const revalidate = 0; // Disable caching for this route segment

// Create a separate component for the main content
async function HomeContent({ data }: { data: Record<string, TrendPreview> }) {
  const topics = [
    "Ecosystem Projects",
    "Community Events",
    "Knowledge Sharing",
    "Technical Innovations",
    "Gaming on Blockchain",
    "Market and Adoption Trends",
    "Developer Resources",
    "For Investors and Enthusiasts",
    "For Enterprises",
    "DAO Governance Updates",
    "Community Stories",
    "Art and NFTs",
    "Sustainability and Impact",
    "Future of Blockchain",
    "Education and Onboarding",
    // "Unknown",
  ];

  // arrange the trends data by the topics index position
  const trendsData = Object.values(data);
  const trends = topics.map((topic) => trendsData.find((trend) => trend.name.includes(topic))).filter((trend) => trend !== undefined);

  // sleep for 10 seconds
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <div
      style={{
        backgroundImage: "url('https://arweave.net/2pZ3ePbY7OT9NZRjNOo1F3fixPBShSRBr-B7uHCwIrI')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto pt-10 p-4">
        <h1 className="text-lg font-bold mb-8 text-left flex items-center gap-2">
          <IconTrendingUp className="w-4 h-4" />
          Trending Topics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4">
          {trends.map((trend, index) => {
            let className = "h-full";

            // Assign different sizes to specific cards
            if (index === 0) className += " lg:col-span-2 lg:row-span-1";
            else if (index === 1) className += " lg:col-span-2 lg:row-span-1";
            else if (index === 4) className += " lg:col-span-2";
            else if (index === 6) className += " lg:col-span-2";
            else if (index === 13) className += " lg:col-span-2";
            else if (index === 15) className += " lg:col-span-4";

            return (
              <Link className={className} key={index} href={`/trend?topic=${trend.slug}`}>
                <GenericTrendCard data={trend} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [trends, setTrends] = useState<Record<string, TrendPreview> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const data = await sendDryRunGameMessage<Record<string, TrendPreview>>({
          tags: [{ name: "Action", value: "GetTrends" }],
        });
        setTrends(data.data);
      } catch (error) {
        console.error("Error fetching trends:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrends();
  }, []);

  if (isLoading) return <Loading />;
  if (!trends) return <div>Failed to load trends</div>;

  return <HomeContent data={trends} />;
}
