import { useState } from "react";

import { getAllTrends } from "@/api/trend";
import { useEffect } from "react";
import { TrendSnapshot } from "@/types/trend";
import { TrendCard } from "@/components/TrendCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [trends, setTrends] = useState<TrendSnapshot[]>([]);

  useEffect(() => {
    const fetchTrends = async () => {
      const trends = await getAllTrends();
      setTrends(trends);
    };
    fetchTrends();
  }, []);

  console.log(trends);

  return (
    <>
      <div className="flex flex-col items-center justify-center p-10">
        <img src="/trends.svg" alt="Trends Logo" className="max-w-64 w-full mb-4" />
        <h2 className="text-3xl text-gray-700 text-center">Homepage of the Permaweb</h2>
      </div>
      <div className="flex flex-col items-center justify-center p-10">
        {trends.map((trend) => (
          <Link prefetch="intent" to={`/trend/${trend.id}`} key={trend.id}>
            <TrendCard trend={trend} />
          </Link>
        ))}
      </div>
    </>
  );
}
