"use client";

import { useEffect, useState } from "react";
import { format } from "timeago.js";

export default function TimeAgoText({ date }: { date: string }) {
  const [time, setTime] = useState(format(new Date(date)));

  useEffect(() => {
    // Calculate time difference in milliseconds
    const getIntervalTime = () => {
      const diff = Date.now() - new Date(date).getTime();
      return diff < 60000 ? 10000 : 60000; // 10s if < 1min, else 1min
    };

    const updateTime = () => {
      setTime(format(new Date(date)));
      // Recalculate interval for next update
      interval = setInterval(updateTime, getIntervalTime());
    };

    let interval = setInterval(updateTime, getIntervalTime());
    return () => clearInterval(interval);
  }, [date]);

  return <span>{time}</span>;
}
