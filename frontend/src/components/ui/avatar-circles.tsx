"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface Avatar {
  imageUrl: string;
  profileUrl: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
}

const AvatarCircles = ({ numPeople, className, avatarUrls }: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          style={{
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
          }}
          className="h-8 w-8 rounded-full border border-[#E8E8E8]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img key={index} className="h-8 w-8 rounded-full" src={url.imageUrl} width={32} height={32} alt={`Avatar ${index + 1}`} />
        </a>
      ))}
      {numPeople && (
        <a
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href="#"
        >
          +{numPeople > 99 ? "99" : numPeople}
        </a>
      )}
    </div>
  );
};

export default AvatarCircles;
