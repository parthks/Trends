import { Calendar, ThumbsUp, Users, RefreshCw, MessageSquare, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendPreview } from "@/utils/types";

export default function GenericTrendCard({ data, className }: { data: TrendPreview; className?: string }) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold line-clamp-1">{data.name}</CardTitle>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CardDescription className="line-clamp-3">{data.description}</CardDescription>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">Updated: {data.last_updated}</span>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span>{data.num_updates} Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{data.total_followers} Followers</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            <span>{data.total_upvotes} Upvotes</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>{Object.keys(data.comments).length} Comments</span>
        </div>
      </CardContent>
    </Card>
  );
}
