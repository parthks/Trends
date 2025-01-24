import { useCompletion } from "ai/react";
import { useState } from "react";
import { Tweet } from "react-tweet";
import { queryAPI, queryContextAPI } from "./api/query";
import SearchBar from "./components/SearchBar";
import Timeline from "./components/Timeline";

export default function Query() {
  const [contextTweetIds, setContextTweetIds] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<number | undefined>(undefined);
  const [toDate, setToDate] = useState<number | undefined>(undefined);

  const createPineconeQueryOptions = (fromDate?: number, toDate?: number) => {
    if (!fromDate || !toDate) {
      return undefined;
    }
    return {
      filter: { created_at: { $gt: fromDate, $lte: toDate } },
    };
  };

  const { completion, complete, isLoading } = useCompletion({
    fetch: (input, init) => {
      console.log(input, init);
      if (init?.body && fromDate && toDate) {
        const body = JSON.parse(init.body as string);
        body.options = createPineconeQueryOptions(fromDate, toDate);
        init.body = JSON.stringify(body);
      }
      console.log(init);
      return queryAPI(input, init);
    },
    onFinish: async (completion) => {
      const response = await queryContextAPI(completion, createPineconeQueryOptions(fromDate, toDate));
      setContextTweetIds(response.results?.map((result: { tweet_id: string }) => result.tweet_id) ?? []);
    },
  });

  console.log(contextTweetIds);

  const handleSearch = async (query: string) => {
    setContextTweetIds([]);
    await complete(query);
  };

  const handleDateClick = (fromDate?: number, toDate?: number) => {
    setFromDate(fromDate);
    setToDate(toDate);
  };

  console.log(fromDate, toDate);

  return (
    <div className="p-4">
      <SearchBar onClick={handleSearch} />
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
      {isLoading && !completion && <div>Loading...</div>}
      <div className="mt-4">{completion}</div>
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {contextTweetIds.map((tweetId) => (
          <Tweet key={tweetId} id={tweetId} />
        ))}
      </div>
    </div>
  );
}
