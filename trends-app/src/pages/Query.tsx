import { useState } from "react";
import { queryContextAPI } from "../api/query";
import SearchBar from "../components/SearchBar";
import Timeline from "../components/Timeline";
import ClientTweetCard from "../components/ClientTweetCard";
import AddTweetToCart from "@/components/AddTweetToCart";
import { ParsedTweetData } from "@/types/tweet";
import { useLocalStore } from "@/lib/store";

export default function Query() {
  const { queryResults, setQueryResults, querySearch, setQuerySearch } = useLocalStore();

  const [loading, setLoading] = useState(false);
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

  const queryPineconeContext = async (completion: string) => {
    setLoading(true);
    console.log("querying pinecone context", completion, fromDate, toDate);
    const response = await queryContextAPI(completion, createPineconeQueryOptions(fromDate, toDate));

    console.log(response);
    setQueryResults(
      response.results?.map((result: { tweet_id: string; score: number; text: string; metadata: ParsedTweetData }) => {
        return {
          ...result.metadata,
        };
      })
    );
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setQueryResults([]);
    // await complete(query);
    await queryPineconeContext(query);
  };

  const handleDateClick = (fromDate?: number, toDate?: number) => {
    setFromDate(fromDate);
    setToDate(toDate);
  };

  console.log(fromDate, toDate);

  return (
    <div className="p-4 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-center max-w-xl mx-auto">
        <SearchBar value={querySearch} onChange={setQuerySearch} onClick={handleSearch} />
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
      {loading && <div>Loading...</div>}
      {/* <div className="mt-4">{completion}</div> */}
      <div className="mt-4 flex flex-col gap-8 justify-center items-center w-full">
        {queryResults.map((tweet) => (
          <div key={tweet.id} className="w-full flex flex-col gap-2">
            <div className="flex-1 shrink-0 w-fit">
              <AddTweetToCart tweet={tweet} />
            </div>
            <ClientTweetCard id={tweet.id} className="w-full max-w-7xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
