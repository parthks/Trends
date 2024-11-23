import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Skeleton className="h-[38px] w-[180px]" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-[300px]" />
          <Skeleton className="h-6 w-[250px]" />
        </div>
        <Skeleton className="h-12 w-[200px]" />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Skeleton className="h-12 w-[150px] rounded-full" />
          <Skeleton className="h-12 w-[150px] rounded-full" />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6">
        <Skeleton className="h-6 w-[100px]" />
        <Skeleton className="h-6 w-[100px]" />
        <Skeleton className="h-6 w-[150px]" />
      </footer>
    </div>
  );
}
