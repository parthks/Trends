import { useEffect, useState } from "react";

export default function SearchBar({ onDebounceSearch, onClick }: { onDebounceSearch?: (query: string) => void; onClick?: (query: string) => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const debounce = setTimeout(() => {
      onDebounceSearch?.(query);
    }, 1000);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="flex items-center justify-center">
      <input onChange={(e) => setQuery(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" type="text" placeholder="Search" />
      {onClick && (
        <button onClick={() => onClick(query)} className="bg-blue-500 text-white rounded-md p-2 ml-3">
          Search
        </button>
      )}
    </div>
  );
}
