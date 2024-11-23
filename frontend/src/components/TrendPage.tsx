import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trend } from "@/utils/types";
import { Share2, ThumbsUp, Flag } from "lucide-react";
import { format } from "timeago.js";

export default function TrendPage({ trendData }: { trendData: Trend }) {
  // sort by date
  const sortedByDate = Object.entries(trendData.byDay).sort((a, b) => {
    return new Date(b[0]).getTime() - new Date(a[0]).getTime();
  });

  return (
    <div className="container mx-auto p-4 w-full h-full">
      <div className="grid md:grid-cols-12 gap-8 h-full">
        {/* Left Column - Main Content */}
        <div className="col-span-6 space-y-6 overflow-y-auto pr-4 h-full">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{trendData.name}</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                upvote
              </Button>
              <Button variant="outline">follow</Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                share
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>updated {format(trendData.last_updated)}</span>
              <span>{trendData.total_upvotes} upvotes</span>
              <span>{trendData.total_followers} following</span>
            </div>
          </div>

          <div className="prose dark:prose-invert">
            <p>{trendData.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">Top Contributors</h2>
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">+30</div>
            </div>
          </div>

          <Card className="p-4">
            <Input placeholder="Add a comment" className="mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">anonymous_hacker</span>
                    <span className="text-sm text-muted-foreground">12 hours ago</span>
                  </div>
                </div>
                <p>this is wild</p>
                <div className="flex items-center gap-4 text-sm">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="w-4 h-4" />3
                  </Button>
                  <Button variant="ghost" size="sm">
                    reply
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    share
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Flag className="w-4 h-4" />
                    report
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="col-span-6 space-y-8 overflow-y-auto pr-4 h-full">
          <h2 className="text-2xl font-bold">Timeline</h2>
          {sortedByDate.map(([date, update]) => {
            const tweets = update.tweets;
            const day = new Date(date).getUTCDate();
            const month = new Date(date).toLocaleString("default", { month: "long" });
            const summary = update.summary;
            // Convert markdown-style links to HTML links
            const summaryWithLinks = summary.replace(
              /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
              '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
            );

            return (
              <div key={date} className="relative pl-12">
                <div className="absolute left-0 flex flex-col items-center">
                  <div className="text-4xl font-bold text-muted-foreground">{day}</div>
                  <div className="text-sm text-muted-foreground">{month}</div>
                </div>
                <Card className="p-4">
                  <p className="mb-4" dangerouslySetInnerHTML={{ __html: summaryWithLinks }}></p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      {update.total_upvotes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      share
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
