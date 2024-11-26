"use client";

import { useEffect, useRef, useState } from "react";
import ClientTweetCard from "../ClientTweetCard";

interface LazyTweetsProps {
  tweets: { id: string }[];
}

export default function LazyTweets({ tweets }: LazyTweetsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex gap-4 min-w-max" ref={containerRef}>
      {tweets.map((tweet) => (
        <div key={tweet.id} className="flex-shrink-0">
          {isVisible && <ClientTweetCard className="w-[226px]" renderMedia={false} id={tweet.id} />}
        </div>
      ))}
    </div>
  );
}
