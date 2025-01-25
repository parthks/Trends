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
  return (
    <div className="p-4 max-h-[calc(100vh-64px)] h-[calc(100vh-64px)] overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-4">Create Trend Snapshot</h1>
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
