import ChatWithCartTweets from "@/components/ChatWithCartTweets";
import CreatePanel from "@/components/CreatePanel";
import TweetCart from "@/components/TweetCart";
import { useLocalStore } from "@/lib/store";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import Split from "react-split";
import Query from "./Query";
import Search from "./Search";

export default function Create() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="p-4 h-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-1 sm:mb-4">
        <h1 className="text-2xl font-bold">Create Trend Snapshot</h1>
        <button className="md:hidden m-2" onClick={() => setShowMobileSearch(!showMobileSearch)}>
          {showMobileSearch ? (
            // close icon
            <button className="p-2 rounded-md bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            // search icon
            <button className="p-2 rounded-md bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          )}
        </button>
      </div>
      {/* split view for desktop */}
      <div className="hidden md:block">
        <Split
          className="flex gap-4 h-[calc(100vh-144px)] max-h-[calc(100vh-144px)]"
          sizes={[50, 50]}
          minSize={200}
          gutterStyle={() => ({
            backgroundColor: "#e2e8f0",
            width: "4px",
            cursor: "col-resize",
          })}
        >
          <div className="overflow-auto h-full">
            <CreatePanel />
          </div>
          <div className="overflow-auto h-full">
            <SearchPanel />
          </div>
        </Split>
      </div>

      {/* mobile view */}
      <div className="md:hidden flex flex-col gap-16">
        {showMobileSearch ? (
          <div className="overflow-auto h-full">
            <SearchPanel />
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <CreatePanel />
          </div>
        )}
      </div>
    </div>
  );
}

function SearchPanel() {
  const [view, setView] = useState<"search" | "query" | "cart" | "chat">("search");
  const tweetCartCount = useLocalStore((state) => state.tweets.length);
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-t ${view === "search" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setView("search")}>
            Search
          </button>
          <button className={`px-4 py-2 rounded-t ${view === "query" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setView("query")}>
            Query
          </button>
        </div>
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-t ${view === "chat" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setView("chat")}>
            Chat
          </button>
          <button className={`px-4 py-2 rounded-t ${view === "cart" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setView("cart")}>
            Cart ({tweetCartCount})
          </button>
        </div>
      </div>

      {/* View content */}
      <div className="mt-4 flex-1 overflow-auto">
        {view === "search" && (
          <div className="h-full">
            <Search />
          </div>
        )}
        {view === "query" && (
          <div>
            <Query />
          </div>
        )}
        {view === "cart" && <TweetCart />}
        {view === "chat" && <ChatWithCartTweets />}
      </div>
    </div>
  );
}
