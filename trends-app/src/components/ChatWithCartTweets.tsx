import { chatAPI } from "@/api/chat";
import { useLocalStore } from "@/lib/store";
import { useCompletion } from "ai/react";
import SearchBar from "./SearchBar";
import { Badge } from "./helpers/Badge";
import ReactMarkdown from "react-markdown";
import { CopyToClipboard } from "./helpers/CopyToClipboard";

export default function ChatWithCartTweets() {
  const tweetsInCart = useLocalStore((state) => state.tweets);
  const chatInput = useLocalStore((state) => state.chatInput);
  const setChatInput = useLocalStore((state) => state.setChatInput);
  const chatResult = useLocalStore((state) => state.chatResult);
  const setChatResult = useLocalStore((state) => state.setChatResult);
  const chatFinished = useLocalStore((state) => state.chatFinished);
  const setChatFinished = useLocalStore((state) => state.setChatFinished);

  const { completion, complete, isLoading, error } = useCompletion({
    fetch: (input, init) => {
      console.log(input, init);
      if (init?.body) {
        const body = JSON.parse(init.body as string);
        body.tweets = tweetsInCart;
        init.body = JSON.stringify(body);
      }
      console.log(init);
      setChatFinished(false);
      setChatResult("");
      return chatAPI(input, init);
    },
    onFinish: async (prompt, completion) => {
      setChatFinished(true);
      console.log("doneee", completion);
      setChatResult(completion);
    },
  });

  const onClickDefaultPrompt = (prompt: string) => {
    setChatInput(prompt);
    setChatFinished(false);
    setChatResult("");
    complete(prompt);
  };

  console.log(chatResult);

  return (
    <div className="p-4">
      <div className=" w-full">
        <SearchBar onClick={() => complete(chatInput)} searchButtonText="Send" value={chatInput} onChange={(e) => setChatInput(e)} />
        <p className="text-sm text-gray-500 mt-2">{tweetsInCart.length} tweets from your cart will be added as context</p>
      </div>

      {/* badges of default prompts */}
      <div className="pt-2 flex flex-wrap">
        <Badge onClick={() => onClickDefaultPrompt("Generate a concise title for my Trend Post")}>Generate Title</Badge>
        <Badge onClick={() => onClickDefaultPrompt("Generate a complete short description for my Trend Post")}>Generate Description</Badge>
        <Badge onClick={() => onClickDefaultPrompt("Generate a comprehensive summary for my Trend Post")}>Generate Summary</Badge>
      </div>

      <div className="flex flex-col mt-4">
        <div>{isLoading && !completion ? "Loading..." : ""}</div>
        {error && <div className="text-red-500">Error: {error.message}</div>}

        {chatFinished && (
          <div className="flex justify-start">
            <CopyToClipboard text={chatResult} />
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{chatFinished ? chatResult : completion}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
