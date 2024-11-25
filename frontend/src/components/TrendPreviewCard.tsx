import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendPreview } from "@/utils/types";
import { IconArrowBadgeUp, IconClockEdit, IconEye } from "@tabler/icons-react";
import Image from "next/image";
import { format } from "timeago.js";

export default function GenericTrendCard({ data, className }: { data: TrendPreview; className?: string }) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-0">
        <div
          style={{
            borderRadius: "6px",
            border: "1px solid #E8E8E8",
            background: `url(https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM) lightgray 50% / cover no-repeat`,
            boxShadow: "0px 2px 16px 0px rgba(0, 0, 0, 0.04)",
          }}
          className="relative h-16"
        >
          <Image src={"https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM"} alt={data.name} fill className="object-contain" />
        </div>
        <div className="flex flex-col gap-2 my-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold line-clamp-1">{data.name}</CardTitle>
            {/* <ShareButton /> */}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconClockEdit className="w-4 h-4" />
              <span>{format(data.last_updated)}</span>
            </div>
            <span className="h-[2px] w-[2px] bg-muted-foreground rounded-full" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconArrowBadgeUp className="w-4 h-4" />
              <span>{data.total_upvotes}</span>
            </div>
            <span className="h-[2px] w-[2px] bg-muted-foreground rounded-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconEye className="w-4 h-4" />
              <span>{data.total_views ?? 0}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CardDescription className="line-clamp-3">{data.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
