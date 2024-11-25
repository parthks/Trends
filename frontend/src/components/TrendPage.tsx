import { Trend } from "@/utils/types";
import { lazy } from "react";
import { format } from "timeago.js";
import Comments from "./Trend/Comments";
import TrendLikeButton from "./Trend/TrendLikeButton";
import AvatarCircles from "./ui/avatar-circles";
import { ShareButton } from "./ShareModal";
import Image from "next/image";
import { IconAward, IconClockEdit } from "@tabler/icons-react";
import TrendHeatMap from "./TrendHeatMap";

// New lazy-loaded component
const TimelineEntry = lazy(() => import("./Trend/TimelineEntry"));

export default function TrendPage({ trendData }: { trendData: Trend }) {
  // sort by date
  const sortedByDate = Object.entries(trendData.byDay).sort((a, b) => {
    return new Date(b[0]).getTime() - new Date(a[0]).getTime();
  });

  const avatars = Object.values(trendData.handles)
    .slice(0, 9)
    .map((handle) => ({
      imageUrl: `https://unavatar.io/x/${handle.handle}`,
      // imageUrl: `https://x.com/${handle.handle}/photo`,
      profileUrl: `https://x.com/${handle.handle}`,
    }));

  return (
    <div className="container mx-auto px-4 pt-10 pb-0 w-full flex-1 flex flex-col">
      <div className="grid md:grid-cols-12 gap-8 sm:min-h-[calc(100vh-7rem)] md:h-[calc(100vh-7rem)]">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-5 lg:mr-10 md:col-span-6 flex flex-col pb-4">
          {/* Fixed Header */}
          <div className="space-y-4">
            {/* Banner Image */}
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid #E8E8E8",
                background: `url(https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM) lightgray 50% / cover no-repeat`,
                boxShadow: "0px 2px 16px 0px rgba(0, 0, 0, 0.04)",
              }}
              className="relative h-16"
            >
              <Image src={"https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM"} alt={trendData.name} fill className="object-contain" />
            </div>
            <h1 className="text-4xl font-bold">{trendData.name}</h1>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendLikeButton upvotes={trendData.upvotes} initialLikes={trendData.total_upvotes} trend={trendData.slug} />
                <ShareButton />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconClockEdit className="w-4 h-4" />
                <span>updated {format(trendData.last_updated)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="prose dark:prose-invert my-6">
              <p>{trendData.description}</p>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-sm mb-2 font-semibold flex items-center gap-[6px]">
                <IconAward className="w-4 h-4" /> Top Contributors
              </h2>
              <div className="flex -space-x-2">
                <AvatarCircles numPeople={Object.values(trendData.handles).length - avatars.length} avatarUrls={avatars} />
              </div>
            </div>

            <Comments initialComments={trendData.comments} trendSlug={trendData.slug} />
          </div>
        </div>

        {/* <div className="col-span-1 md:col-span-0"></div> */}

        {/* Right Column - Timeline */}
        <div className="lg:col-span-7 md:col-span-6 overflow-hidden ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="h-full flex flex-col">
            <div className="flex-none">
              <h2 className="text-2xl font-bold">Timeline</h2>

              {/* heatmap */}
              <div className="md:block hidden mb-10 mt-6">
                <TrendHeatMap trendData={trendData} />
              </div>
            </div>

            <div id="timeline-entries" className="flex-1 overflow-y-auto space-y-6">
              {sortedByDate.map(([date, update]) => (
                <div key={date} id={`timeline-${date.replace(/\//g, "-")}`}>
                  <TimelineEntry date={date} update={update} trendSlug={trendData.slug} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
