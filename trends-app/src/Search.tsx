import { useEffect, useState } from "react";
import { searchAPI } from "./api/search";
import FormattedTweet from "./components/FormattedTweet";
import SearchBar from "./components/SearchBar";
import { SearchResult, SearchResultFacetField } from "./types/search";
import { TypesenseTweetData } from "./types/tweet";
import Timeline from "./components/Timeline";
import { format } from "date-fns";

export default function Search() {
  const [results, setResults] = useState<TypesenseTweetData[]>([]);
  const [users, setUsers] = useState<{ count: number; value: string }[]>([]);
  const [topics, setTopics] = useState<{ count: number; value: string }[]>([]);
  const [entities, setEntities] = useState<{ count: number; value: string }[]>([]);

  const [fromDate, setFromDate] = useState<number | undefined>(undefined);
  const [toDate, setToDate] = useState<number | undefined>(undefined);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const fetchResults = async () => {
      const results: SearchResult = await searchAPI(query, {
        from: fromDate,
        to: toDate,
      });
      handleResults(results);
    };
    fetchResults();
  }, [query, fromDate, toDate]);

  const handleResults = (results: SearchResult) => {
    setResults(results.hits.map((hit) => hit.document));
    setUsers(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_USERS)?.counts || []);
    setTopics(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_TOPICS)?.counts || []);
    setEntities(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_ENTITIES)?.counts || []);
  };

  const handleDateClick = (fromDate?: number, toDate?: number) => {
    console.log(fromDate, toDate);
    setFromDate(fromDate);
    setToDate(toDate);
  };

  const handleSearch = (query: string) => {
    setQuery(query);
  };

  console.log(users, topics, entities);

  return (
    <div className="p-4">
      <SearchBar onDebounceSearch={handleSearch} />
      <div className="my-4">
        <Timeline onDateClick={handleDateClick} />
        {fromDate && toDate && (
          <div className="mt-4">
            <p>
              Filtering from {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap">
            {users.map((user) => (
              <p key={user.value} className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1 m-1">
                {user.value} ({user.count})
              </p>
            ))}
          </div>
          <div className="flex flex-wrap">
            {topics.map((topic) => (
              <p key={topic.value} className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1 m-1">
                {topic.value} ({topic.count})
              </p>
            ))}
          </div>
          <div className="flex flex-wrap">
            {entities.map((entity) => (
              <p key={entity.value} className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1 m-1">
                {entity.value} ({entity.count})
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {results.map((result) => (
          <div key={result.id} className="flex flex-col gap-1 border rounded p-4">
            <p className="text-sm text-gray-500">Tweeted on {format(new Date(result.created_at), "dd MMM yyyy")}</p>
            <p className="text-sm text-gray-500">Key Insight: {result.keyHighlight}</p>
            <FormattedTweet tweet={result} />
          </div>
        ))}
      </div>
    </div>
  );
}
