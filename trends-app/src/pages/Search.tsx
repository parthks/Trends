import { useLocalStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { searchAPI } from "../api/search";
import FormattedTweet from "../components/FormattedTweet";
import SearchBar from "../components/SearchBar";
import { SearchFaucetResults } from "../components/SearchFaucetResults";
import Timeline from "../components/Timeline";
import { SearchResult, SearchResultFacetField } from "../types/search";
import { TypesenseTweetData } from "../types/tweet";

export default function Search() {
  const [results, setResults] = useState<TypesenseTweetData[]>([]);
  const [fromUsers, setFromUsers] = useState<{ count: number; value: string }[]>([]);
  const [users, setUsers] = useState<{ count: number; value: string }[]>([]);
  const [topics, setTopics] = useState<{ count: number; value: string }[]>([]);
  const [entities, setEntities] = useState<{ count: number; value: string }[]>([]);

  const [fromDate, setFromDate] = useState<number | undefined>(undefined);
  const [toDate, setToDate] = useState<number | undefined>(undefined);
  const { searchString, setSearchString } = useLocalStore();

  useEffect(() => {
    const fetchResults = async () => {
      const results: SearchResult = await searchAPI(searchString, {
        from: fromDate,
        to: toDate,
      });
      handleResults(results);
    };
    fetchResults();
  }, [searchString, fromDate, toDate]);

  const handleResults = (results: SearchResult) => {
    console.log("raw results", results);
    setResults(results.hits.map((hit) => hit.document));
    setFromUsers(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.USER_NAME)?.counts || []);
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
    setSearchString(query);
  };

  console.log({ fromUsers, users, topics, entities, results });

  return (
    <div className="h-full p-4 overflow-auto flex flex-col">
      <div className="flex-none">
        <div className="flex justify-center">
          <SearchBar value={searchString} onDebounceSearch={handleSearch} />
        </div>
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
            <SearchFaucetResults title="From Users" results={fromUsers} />
            <SearchFaucetResults title="Users" results={users} />
            <SearchFaucetResults title="Topics" results={topics} />
            <SearchFaucetResults title="Entities" results={entities} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <FormattedTweet key={result.id} tweet={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
