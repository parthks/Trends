import { Skeleton } from "@/components/ui/skeleton";

function TrendCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`w-full rounded-lg border bg-card p-6 shadow ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-[200px]" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-10 w-48 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* First row - larger cards */}
        <div className="md:col-span-2 md:row-span-1">
          <TrendCardSkeleton className="h-full" />
        </div>
        <div className="md:col-span-2 md:row-span-1">
          <TrendCardSkeleton className="h-full" />
        </div>
        {/* Generate 12 more regular sized cards */}
        {Array.from({ length: 12 }).map((_, index) => {
          let className = "h-full";
          if (index === 2) className += " md:col-span-2"; // Card 5
          if (index === 4) className += " md:col-span-2"; // Card 7
          if (index === 11) className += " md:col-span-2"; // Card 14

          return <TrendCardSkeleton key={index} className={className} />;
        })}
        {/* Last full-width card */}
        <div className="md:col-span-4">
          <TrendCardSkeleton className="h-full" />
        </div>
      </div>
    </div>
  );
}
