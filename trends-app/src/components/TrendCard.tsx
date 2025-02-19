import { TrendSnapshot } from "@/types/trend";

export const TrendCard = ({ trend }: { trend: TrendSnapshot }) => {
  return (
    <div className="border rounded-lg p-4 w-full">
      <h2 className="text-2xl font-bold mb-2">{trend.title}</h2>
      <p className="text-gray-600 mb-4">{new Date(trend.createdAt).toLocaleDateString()}</p>
      <p className="text-gray-600 mb-4">{trend.description}</p>
    </div>
  );
};

export const TrendCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 w-full">
      <div className="h-8 bg-gray-200 rounded-md mb-2 w-2/4"></div>
      <div className="h-4 bg-gray-200 rounded-md mb-4 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-md mb-2 w-full"></div>
      <div className="h-4 bg-gray-200 rounded-md mb-2 w-full"></div>
      <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
    </div>
  );
};
