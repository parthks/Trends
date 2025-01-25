"use client";

import { useEffect, useRef, useState } from "react";

interface LazyLoadContentProps<T extends { id: string | number }> {
  dataArray: T[];
  renderItem: (item: T) => React.ReactNode;
  scrollDirection: "vertical" | "horizontal";
}

export default function LazyLoadContent<T extends { id: string | number }>({ dataArray, renderItem, scrollDirection }: LazyLoadContentProps<T>) {
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
    <div className={`flex gap-4 min-w-max ${scrollDirection === "vertical" ? "flex-col" : "flex-row"}`} ref={containerRef}>
      {dataArray.map((item) => (
        <div key={item.id} className="flex-shrink-0">
          {isVisible && renderItem(item)}
        </div>
      ))}
    </div>
  );
}
