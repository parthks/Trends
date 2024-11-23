import GenericTrendCard from "@/components/TrendPreviewCard";
import { TrendPreview } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import { Suspense } from "react";
import Loading from "./loading";
import Link from "next/link";
// Create a separate component for the main content
async function HomeContent() {
  const data = await sendDryRunGameMessage<Record<string, TrendPreview>>({ tags: [{ name: "Action", value: "GetTrends" }] });
  console.log(data);

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
    "Unknown",
  ];

  // arrange the trends data by the topics index position
  const trendsData = Object.values(data.data);
  const trends = topics.map((topic) => trendsData.find((trend) => trend.name.includes(topic))).filter((trend) => trend !== undefined);

  // sleep for 10 seconds
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Trending Topics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {trends.map((trend, index) => {
          let className = "h-full";

          // Assign different sizes to specific cards
          if (index === 0) className += " md:col-span-2 md:row-span-1";
          else if (index === 1) className += " md:col-span-2 md:row-span-1";
          else if (index === 4) className += " md:col-span-2";
          else if (index === 6) className += " md:col-span-2";
          else if (index === 13) className += " md:col-span-2";
          else if (index === 15) className += " md:col-span-4";

          return (
            <Link className={className} key={index} href={`/trend/${trend.slug}`}>
              <GenericTrendCard data={trend} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}
