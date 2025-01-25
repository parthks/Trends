import { getTrend } from "@/api/trend";
import FormattedTweet from "@/components/FormattedTweet";
import { TrendSnapshot } from "@/types/trend";
import { TypesenseTweetData } from "@/types/tweet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TrendSnapshotPage() {
  const { id } = useParams();
  const [trend, setTrend] = useState<TrendSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!id) return;
      try {
        const trend = await getTrend(id);
        setTrend(trend);
      } catch (error) {
        console.error("Error fetching trend", error);
      }
      setIsLoading(false);
    };
    fetchTrend();
  }, [id]);

  console.log("trend", trend);

  if (isLoading) return <TrendSnapshotSkeleton />;
  if (!trend) return <div>Trend not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 h-full overflow-y-auto">
      <div className="h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{trend.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{trend.description}</p>
          <time className="text-sm text-gray-500">Created on {new Date(trend.createdAt).toLocaleDateString()}</time>
        </header>

        <div className="prose prose-md max-w-none mb-8 [&>p]:my-0" dangerouslySetInnerHTML={{ __html: trend.data }} />

        {trend.tweets && trend.tweets.length > 0 && (
          <section className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Related Tweets</h2>
            <div className="space-y-4">
              {trend.tweets.map((tweet) => (
                <FormattedTweet tweet={tweet as TypesenseTweetData} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TrendSnapshotSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 h-full overflow-y-auto">
      <div className="h-full overflow-y-auto">
        <header className="mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-full mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-1/4 animate-pulse" />
        </header>

        <div className="space-y-4 mb-8">
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse" />
        </div>

        <div className="border-t pt-6">
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-20 bg-gray-200 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
