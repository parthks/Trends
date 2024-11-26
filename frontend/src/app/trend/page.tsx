"use client";

import CommunityTimeline from "@/components/TrendPage";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import { useEffect, useState } from "react";
import Loading from "@/app/trend/loading";
import { useSearchParams } from "next/navigation";

export default function TrendPage() {
  const [trendData, setTrendData] = useState<Trend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "ecosystem-projects";

  useEffect(() => {
    async function fetchTrend() {
      try {
        const data = await sendDryRunGameMessage<Trend>({
          tags: [
            { name: "Action", value: "GetTrend" },
            { name: "Trend", value: topic },
          ],
        });
        setTrendData(data.data);
      } catch (error) {
        console.error("Error fetching trend:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrend();
  }, [topic]);

  if (isLoading) return <Loading />;
  if (!trendData) return <div>Failed to load trend</div>;

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
