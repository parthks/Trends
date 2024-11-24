import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Trend } from "@/utils/types";
import TweetCard from "../TweetCard";
import UpdateLikeButton from "./UpdateLikeButton";

export default function TimelineEntry({ date, update, trendSlug }: { date: string; update: Trend["byDay"][string]; trendSlug: string }) {
  const day = new Date(date).getUTCDate();
  const month = new Date(date).toLocaleString("default", { month: "long" });
  const tweets = update.tweets;

  const summary = update.summary;
  const summaryWithTwitterHandles = summary.replace(
    /@(\w+)/g,
    '<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">@$1</a>'
  );
  const summaryWithLinks = summaryWithTwitterHandles.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
  );
  const summaryWithLineBreaks = summaryWithLinks.replace(/\n/g, "<br />");

  return (
    <div className="flex gap-4 max-w-full">
      <div className="flex flex-col items-center min-w-[65px]">
        <div className="text-4xl font-bold text-muted-foreground">{day}</div>
        <div className="text-sm text-muted-foreground">{month}</div>
      </div>
      <Card style={{ width: "calc(100% - 65px)" }} className="p-4 flex-1">
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: summaryWithLineBreaks }}></p>
        <p className="text-sm font-bold">Trending Messages</p>
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="flex-shrink-0">
                <TweetCard className="w-[280px]" renderMedia={false} id={tweet.id} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UpdateLikeButton initialLikes={update.total_upvotes} upvotes={update.upvotes} trendSlug={trendSlug} date={date} />
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            share
          </Button>
        </div>
      </Card>
    </div>
  );
}
