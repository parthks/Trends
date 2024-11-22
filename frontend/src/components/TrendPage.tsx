import { Button } from "@/components/ui/button";
import { Trend } from "@/utils/types";
import { Share2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { format } from "timeago.js";
import Comments from "./Trend/Comments";
import TrendLikeButton from "./Trend/TrendLikeButton";
import AvatarCircles from "./ui/avatar-circles";

// New lazy-loaded component
const TimelineEntry = lazy(() => import("./Trend/TimelineEntry"));

export default function TrendPage({ trendData }: { trendData: Trend }) {
  // sort by date
  const sortedByDate = Object.entries(trendData.byDay).sort((a, b) => {
    return new Date(b[0]).getTime() - new Date(a[0]).getTime();
  });

  const avatars = Object.values(trendData.handles)
    .slice(0, 14)
    .map((handle) => ({
      imageUrl: `https://unavatar.io/x/${handle.handle}`,
      // imageUrl: `https://x.com/${handle.handle}/photo`,
      profileUrl: `https://x.com/${handle.handle}`,
    }));

  return (
    <div className="container mx-auto p-4 w-full flex-1 flex flex-col">
      <div className="grid md:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
        {/* Left Column - Main Content */}
        <div className="col-span-6 overflow-y-auto pr-4">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{trendData.name}</h1>
            <div className="flex items-center gap-4">
              <TrendLikeButton upvotes={trendData.upvotes} initialLikes={trendData.total_upvotes} trend={trendData.slug} />
              {/* <Button variant="outline">follow</Button> */}
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                share
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>updated {format(trendData.last_updated)}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert">
            <p>{trendData.description}</p>
          </div>

          <div className="space-y-4 mt-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">Top Contributors</h2>
            <div className="flex -space-x-2">
              <AvatarCircles numPeople={Object.values(trendData.handles).length - avatars.length} avatarUrls={avatars} />
            </div>
          </div>

          <Comments initialComments={trendData.comments} trendSlug={trendData.slug} />
        </div>

        {/* Right Column - Timeline */}
        <div className="col-span-6 overflow-y-auto pr-4">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Timeline</h2>
            {sortedByDate.map(([date, update]) => (
              <Suspense key={date} fallback={<div className="animate-pulse h-40 bg-muted rounded-lg"></div>}>
                <TimelineEntry date={date} update={update} trendSlug={trendData.slug} />
              </Suspense>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
