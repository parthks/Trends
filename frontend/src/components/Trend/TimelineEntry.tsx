import { Card } from "@/components/ui/card";
import { Trend } from "@/utils/types";
import { IconTrendingUp } from "@tabler/icons-react";
import { ShareButton } from "../ShareModal";
import TweetCard from "../TweetCard";
import UpdateLikeButton from "./UpdateLikeButton";

export default function TimelineEntry({ date, update, trendSlug }: { date: string; update: Trend["byDay"][string]; trendSlug: string }) {
  const day = new Date(date).getUTCDate().toString().padStart(2, "0");
  const month = new Date(date).toLocaleString("default", { month: "short" });
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
    <div className="flex flex-col md:flex-row gap-4 max-w-full min-w-0">
      <div className="flex flex-col md:items-center min-w-[65px]">
        <div className="text-4xl font-bold text-muted-foreground">{day}</div>
        <div className="text-sm font-bold text-muted-foreground">{month}</div>
      </div>
      <Card className="p-4 flex-1 min-w-0 w-full md:w-[calc(100%-65px)]">
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: summaryWithLineBreaks }}></p>
        <p className="text-sm font-bold mb-2 flex items-center gap-2">
          <IconTrendingUp className="w-4 h-4" />
          Trending Messages
        </p>
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="flex-shrink-0">
                <TweetCard className="w-[226px]" renderMedia={false} id={tweet.id} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4">
          <UpdateLikeButton initialLikes={update.total_upvotes} upvotes={update.upvotes} trendSlug={trendSlug} date={date} />
          <ShareButton />
        </div>
      </Card>
    </div>
  );
}
