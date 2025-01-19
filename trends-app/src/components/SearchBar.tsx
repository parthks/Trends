import { useEffect, useState } from "react";

export default function SearchBar({ onDebounceSearch }: { onDebounceSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const debounce = setTimeout(() => {
      onDebounceSearch(query);
    }, 1000);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="flex flex-col items-center justify-center">
      <input onChange={(e) => setQuery(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" type="text" placeholder="Search" />
    </div>
  );
}
