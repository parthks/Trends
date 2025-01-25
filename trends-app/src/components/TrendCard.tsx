import { TrendSnapshot } from "@/types/trend";

export const TrendCard = ({ trend }: { trend: TrendSnapshot }) => {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-2">{trend.title}</h2>
      <p className="text-gray-600 mb-4">{trend.createdAt}</p>
      <p className="text-gray-600 mb-4">{trend.description}</p>
    </div>
  );
};
