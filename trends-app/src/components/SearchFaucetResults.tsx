export const SearchFaucetResults = ({ title, results }: { title: string; results: { count: number; value: string }[] }) => {
  return (
    <div className="flex">
      <label className="text-md font-bold px-2 py-1 m-1 shrink-0">{title}:</label>
      <div className="overflow-x-auto">
        <div className="flex flex-nowrap">
          {results.map((result) => (
            <p key={result.value} className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1 m-1 whitespace-nowrap">
              {result.value} ({result.count})
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
