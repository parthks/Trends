import { useEffect, useState } from "react";

export default function SearchBar({
  onDebounceSearch,
  onClick,
  value,
  onChange,
  searchButtonText,
}: {
  onDebounceSearch?: (query: string) => void;
  onClick?: (query: string) => void;
  value?: string;
  onChange?: (query: string) => void;
  searchButtonText?: string;
}) {
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    const debounce = setTimeout(() => {
      onDebounceSearch?.(query);
    }, 1000);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  return (
    <div className="flex w-full max-w-xl">
      <div className="relative w-full">
        <input
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          value={query}
          className="border-2 border-gray-300 rounded-md p-2 pr-6 w-full"
          type="text"
          placeholder="Search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onChange?.("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 shrink-0"
            type="button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {onClick && (
        <button onClick={() => onClick(query)} className="bg-blue-500 text-white rounded-md p-2 ml-3">
          {searchButtonText || "Search"}
        </button>
      )}
    </div>
  );
}
