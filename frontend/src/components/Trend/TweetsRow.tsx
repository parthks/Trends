import TweetCard from "../TweetCard";

export default function TweetsRow({ tweets }: { tweets: { id: string }[] }) {
  return (
    <div className="mb-4 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 -mb-4">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="flex-shrink-0">
            <TweetCard className="w-[250px]" renderMedia={false} id={tweet.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
