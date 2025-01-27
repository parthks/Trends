import { TypesenseTweetData } from "@/types/tweet";
import AddTweetToCart from "./AddTweetToCart";
import { format } from "date-fns";

export default function FormattedTweet({ tweet }: { tweet: TypesenseTweetData }) {
  const images = [
    ...tweet.media.filter((media) => media.type === "photo").map((media) => media.url),
    ...(tweet.quote_media?.filter((media) => media.type === "photo").map((media) => media.url) || []),
  ];
  const video_urls = [
    ...tweet.media.filter((media) => media.type === "video").map((media) => media.url),
    ...(tweet.quote_media?.filter((media) => media.type === "video").map((media) => media.url) || []),
  ];
  return (
    <div key={tweet.id} className="flex flex-col gap-1 border rounded p-4">
      <AddTweetToCart tweet={tweet} />
      <div className="flex justify-between gap-1">
        <div className="flex gap-1">
          <a href={`https://x.com/${tweet.user_name}/status/${tweet.id}`} target="_blank" rel="noopener noreferrer" className="inline-block ml-1">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-gray-500">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <p className="text-sm text-gray-500">Tweeted on {format(new Date(tweet.created_at), "dd MMM yyyy")}</p>
        </div>
        <p className="text-sm text-gray-500">{tweet.is_reply ? "Reply" : tweet.is_quote ? "Quoted" : "Original"}</p>
      </div>
      <p className="text-sm text-gray-500">Key Insight: {tweet.keyHighlight}</p>

      <div key={tweet.id} className="flex flex-wrap gap-4 w-full break-words">
        <div className="flex flex-col sm:flex-1 min-w-0">
          <p>
            <span className="font-bold">{tweet.user_name}</span>: <FormattedTweetText text={tweet.text} media={tweet.media} />
          </p>
          {tweet.quote && (
            <p>
              <span className="font-bold">{tweet.quote_user_name}</span>: <FormattedTweetText text={tweet.quote} media={tweet.quote_media} />
            </p>
          )}
        </div>
        {images.length + video_urls.length > 0 && (
          <div className="shrink-0 mx-auto overflow-x-auto w-full">
            <div className="flex w-full overflow-x-auto gap-2 pr-2">
              {images.map((image) => (
                <a key={image} href={image} target="_blank" rel="noopener noreferrer">
                  <img src={image} alt="tweet media" className="max-w-64 max-h-64 rounded-lg object-contain flex-shrink-0" />
                </a>
              ))}
            </div>
            {video_urls.length > 0 && (
              <div className="flex gap-2 pr-2">
                {video_urls.map((video) => (
                  <a key={video} href={video} target="_blank" rel="noopener noreferrer">
                    <video controls src={video} className="w-64 h-64 rounded-lg object-contain flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedTweetText({ text, media }: { text: string | undefined; media: TypesenseTweetData["media"] | undefined }) {
  let formattedText = text;

  // for each media, find the url in text and replace it with a link
  media?.forEach((media) => {
    const original_url = media.original_url;
    if (media.type === "photo" || media.type === "video") {
      formattedText = formattedText?.replace(original_url, "");
    } else {
      formattedText = formattedText?.replace(
        original_url,
        `<a style="color: #3b82f6; text-decoration: underline;" href="${media.url}" target="_blank" rel="noopener noreferrer">${media.type}</a>`
      );
    }
  });

  // format all links in text to be clickable
  formattedText = formattedText?.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a style="color: #3b82f6; text-decoration: underline;" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: formattedText || "",
      }}
    />
  );
}
