"use client";

import { Trend } from "@/utils/types";
import HeatMap from "@uiw/react-heat-map";
// import Tooltip from "@uiw/react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import { Tooltip } from "react-tooltip";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrendHeatMap({ trendData }: { trendData: Trend }) {
  const [selected, setSelected] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      const timelineContainer = document.getElementById("timeline-entries");
      const targetElement = document.getElementById(`timeline-${dateParam}`);

      if (timelineContainer && targetElement) {
        timelineContainer.scrollTo({
          top: targetElement.offsetTop - timelineContainer.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, []);

  // Add this function to prepare heat map data
  const getHeatMapData = () => {
    return Object.entries(trendData.byDay).map(([date, update]) => ({
      date,
      count: update.tweets.length,
    }));
  };
  return (
    <div className="relative">
      <HeatMap
        value={getHeatMapData()}
        width={"100%"}
        height={"160"}
        panelColors={["#ebf8ff", "#c2e9ff", "#99daff", "#70cbff", "#47bcff", "#10a7ff"]}
        style={{ paddingLeft: "80px" }}
        startDate={new Date(Object.keys(trendData.byDay)[Object.keys(trendData.byDay).length - 1])}
        endDate={new Date()}
        rectSize={16}
        space={4}
        legendCellSize={0}
        rectProps={{
          rx: 4,
          ry: 4,
        }}
        rectRender={(props, data) => {
          if (!data.count) return <rect {...props} />;
          return (
            <rect
              onClick={() => {
                setSelected(data.date === selected ? "" : data.date);
                if (data.date !== selected) {
                  const [year, month, day] = data.date.split("/");
                  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

                  const timelineContainer = document.getElementById("timeline-entries");
                  const targetElement = document.getElementById(`timeline-${formattedDate}`);

                  if (timelineContainer && targetElement) {
                    timelineContainer.scrollTo({
                      top: targetElement.offsetTop - timelineContainer.offsetTop,
                      behavior: "smooth",
                    });
                  }
                  router.push(`?date=${formattedDate}`);
                } else {
                  router.replace(``);
                }
              }}
              {...props}
              data-tooltip-id="my-tooltip"
              data-tooltip-content={`${data.date}: ${data.count || 0} tweets`}
            />
          );
        }}
      />
      <Tooltip id="my-tooltip" />
    </div>
  );
}
