import { useState } from "react";
import { searchAPI } from "./api/search";
import FormattedTweet from "./components/FormattedTweet";
import SearchBar from "./components/SearchBar";
import { SearchResult, SearchResultFacetField } from "./types/search";
import { TypesenseTweetData } from "./types/tweet";

export default function Search() {
  const [results, setResults] = useState<TypesenseTweetData[]>([]);
  const [users, setUsers] = useState<{ count: number; value: string }[]>([]);
  const [topics, setTopics] = useState<{ count: number; value: string }[]>([]);
  const [entities, setEntities] = useState<{ count: number; value: string }[]>([]);

  const handleSearch = async (query: string) => {
    console.log(query);
    const results: SearchResult = await searchAPI(query);
    console.log(results);
    setResults(results.hits.map((hit) => hit.document));
    setUsers(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_USERS)?.counts || []);
    setTopics(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_TOPICS)?.counts || []);
    setEntities(results.facet_counts.find((facet) => facet.field_name === SearchResultFacetField.KEY_ENTITIES)?.counts || []);
  };

  console.log(users, topics, entities);

  return (
    <div className="p-4">
      <SearchBar onDebounceSearch={handleSearch} />

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
          <div key={result.id} className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">Key Insight: {result.keyHighlight}</p>
            <FormattedTweet tweet={result} />
          </div>
        ))}
      </div>
    </div>
  );
}
