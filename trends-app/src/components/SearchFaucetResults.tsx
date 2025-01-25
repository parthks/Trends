import { Badge } from "./helpers/Badge";

export const SearchFaucetResults = ({ title, results }: { title: string; results: { count: number; value: string }[] }) => {
  return (
    <div className="flex">
      <label className="text-md font-bold py-1 mr-1 mb-1 shrink-0">{title}:</label>
      <div className="overflow-x-auto">
        <div className="flex flex-nowrap">
          {results.map((result) => (
            <Badge key={result.value}>
              {result.value} ({result.count})
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
