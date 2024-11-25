import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (1/3 width) */}
        <div className="lg:col-span-5 lg:mr-10 md:col-span-6 space-y-6 flex flex-col pb-4">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Posts Skeleton */}
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                {/* Post Header */}
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/6" />
                  </div>
                </div>
                {/* Post Content */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                {/* Post Footer */}
                <div className="flex space-x-4 pt-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2/3 width) */}
        <div className="lg:col-span-7 md:col-span-6 ml-4 pl-4  space-y-6">
          {/* Trend Info Card */}
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Related Trends */}
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
