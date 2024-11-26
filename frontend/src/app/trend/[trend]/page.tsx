"use client";

import CommunityTimeline from "@/components/TrendPage";
import { Trend } from "@/utils/types";
import { sendDryRunGameMessage } from "@/utils/wallet";
import { useEffect, useState } from "react";
import Loading from "@/app/trend/[trend]/loading";

export default function TrendPage({ params }: { params: { trend: string } }) {
  const [trendData, setTrendData] = useState<Trend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      try {
        const data = await sendDryRunGameMessage<Trend>({
          tags: [
            { name: "Action", value: "GetTrend" },
            { name: "Trend", value: params.trend },
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
  }, [params.trend]);

  if (isLoading) return <Loading />;
  if (!trendData) return <div>Failed to load trend</div>;

  return (
    <div>
      <CommunityTimeline trendData={trendData} />
    </div>
  );
}
