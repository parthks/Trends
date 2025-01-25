import { ParsedTweetData } from "@/types/tweet";
import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { createJSONStorage } from 'zustand/middleware'

interface StoreState {
  tweets: ParsedTweetData[];
  addTweet: (tweet: ParsedTweetData) => void;
  removeTweet: (tweet: ParsedTweetData) => void;
  removeAllTweets: () => void;

  querySearch: string;
  setQuerySearch: (query: string) => void;
  queryResults: ParsedTweetData[];
  setQueryResults: (results: ParsedTweetData[]) => void;

  searchString: string;
  setSearchString: (searchString: string) => void;

  chatInput: string;
  setChatInput: (chatInput: string) => void;
  chatFinished: boolean;
  setChatFinished: (chatFinished: boolean) => void;
  chatResult: string;
  setChatResult: (chatResult: string) => void;
}

export const useLocalStore = create<StoreState>()(
  persist(
    (set) => ({
      tweets: [],
      addTweet: (tweet: ParsedTweetData) => set((state) => ({ tweets: [...state.tweets, tweet] })),
      removeTweet: (tweet: ParsedTweetData) => set((state) => ({ tweets: state.tweets.filter((t) => t.id !== tweet.id) })),
      removeAllTweets: () => set({ tweets: [] }),

      querySearch: "",
      setQuerySearch: (query: string) => set({ querySearch: query }),
      queryResults: [],
      setQueryResults: (results: ParsedTweetData[]) => set({ queryResults: results }),

      searchString: "",
      setSearchString: (searchString: string) => set({ searchString }),

      chatInput: "",
      setChatInput: (chatInput: string) => set({ chatInput }),
      chatFinished: false,
      setChatFinished: (chatFinished: boolean) => set({ chatFinished }),
      chatResult: "",
      setChatResult: (chatResult: string) => set({ chatResult }),
    }),
    { name: "tweets" }
  )
);
