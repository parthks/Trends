import { useState } from "react";

import { getAllTrends } from "@/api/trend";
import { useEffect } from "react";
import { TrendSnapshot } from "@/types/trend";
import { TrendCard, TrendCardSkeleton } from "@/components/TrendCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [trends, setTrends] = useState<TrendSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      const trends = await getAllTrends();
      setTrends(trends);
      setIsLoading(false);
    };
    fetchTrends();
  }, []);

  console.log(trends);

  return (
    <div className="h-full overflow-y-auto p-4 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center">
        <img src="/trends.svg" alt="Trends Logo" className="max-w-64 w-full mb-4" />
        <h2 className="text-3xl text-gray-700 text-center">Homepage of the Permaweb</h2>
      </div>

      <div className="my-10 flex flex-wrap justify-center gap-8">
        <a
          className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          target="_blank"
          href="https://x.com/trendtru"
        >
          About Us
        </a>
        <Link
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          to="/create"
        >
          Create Trend Snapshot
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        {isLoading ? (
          <>
            <TrendCardSkeleton />
            <TrendCardSkeleton />
            <TrendCardSkeleton />
          </>
        ) : (
          trends.map((trend) => (
            <Link prefetch="intent" to={`/trend/${trend.id}`} key={trend.id}>
              <TrendCard trend={trend} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
