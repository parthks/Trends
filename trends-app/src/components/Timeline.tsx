import { useState } from "react";
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

type TimeRange = "all" | "monthly" | "weekly" | "daily";

interface TimelineProps {
  onDateClick: (fromDate?: number, toDate?: number) => void;
}

const MIN_DATE = new Date(2024, 0, 0);

export default function Timeline({ onDateClick }: TimelineProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("all");
  const [items, setItems] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate initial date items based on selected range
  const generateItems = (range: TimeRange) => {
    const today = new Date();
    const newItems: Date[] = [];

    switch (range) {
      case "daily":
        for (let i = 0; i < 30; i++) {
          const date = subDays(today, i);
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
      case "weekly":
        for (let i = 0; i < 12; i++) {
          const date = startOfWeek(subWeeks(today, i));
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
      case "monthly":
        for (let i = 0; i < 12; i++) {
          const date = subMonths(today, i);
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
    }
    setItems(newItems);
  };

  // Generate dates based on the last date in the list
  const generateMoreDates = () => {
    if (items.length === 0) return;

    const lastDate = items[items.length - 1];
    const newItems: Date[] = [];

    switch (selectedRange) {
      case "daily":
        for (let i = 1; i <= 30; i++) {
          const date = subDays(lastDate, i);
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
      case "weekly":
        for (let i = 1; i <= 12; i++) {
          const date = startOfWeek(subWeeks(lastDate, i));
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
      case "monthly":
        for (let i = 1; i <= 12; i++) {
          const date = subMonths(lastDate, i);
          if (date >= MIN_DATE) {
            newItems.push(date);
          }
        }
        break;
    }
    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    // If we're within 300px of the end, load more dates
    if (scrollWidth - (scrollLeft + clientWidth) < 300) {
      generateMoreDates();
    }
  };

  // Format date based on range type
  const formatDate = (date: Date, range: TimeRange) => {
    switch (range) {
      case "daily":
        return (
          <>
            <div className="text-lg">{format(date, "dd MMM")}</div>
            <div className="text-sm text-gray-500">{format(date, "yyyy")}</div>
          </>
        );
      case "weekly":
        return (
          <>
            <div className="text-lg">
              {format(date, "dd MMM")} - {format(endOfWeek(date), "dd MMM")}
            </div>
            <div className="text-sm text-gray-500">{format(date, "yyyy")}</div>
          </>
        );
      case "monthly":
        return (
          <>
            <div className="text-lg">{format(date, "MMMM")}</div>
            <div className="text-sm text-gray-500">{format(date, "yyyy")}</div>
          </>
        );
      default:
        return "";
    }
  };

  const getDateRange = (date: Date, range: TimeRange): [Date, Date] => {
    switch (range) {
      case "daily":
        return [startOfDay(date), endOfDay(date)];
      case "weekly":
        return [startOfDay(startOfWeek(date)), endOfDay(endOfWeek(date))];
      case "monthly":
        return [startOfDay(startOfMonth(date)), endOfDay(endOfMonth(date))];
      default:
        return [startOfDay(date), endOfDay(date)];
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div>
          <p className="text-lg font-bold">Timeline Filter:</p>
        </div>
        <div className="flex items-center gap-4">
          {["all", "monthly", "weekly", "daily"].map((range) => (
            <button
              key={range}
              className={`px-4 py-2 rounded ${selectedRange === range ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => {
                setSelectedRange(range as TimeRange);
                generateItems(range as TimeRange);
                if (range === "all") {
                  onDateClick(undefined, undefined);
                }
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline content */}
      {selectedRange === "all" ? (
        <div></div>
      ) : (
        <div className="overflow-x-auto" onScroll={handleScroll}>
          <div className="flex gap-2 p-4 min-w-max">
            {items.map((date, index) => (
              <div
                key={index}
                className={`min-w-[120px] p-3 border rounded shadow cursor-pointer transition-colors text-center
                    ${selectedDate?.getTime() === date.getTime() ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
                onClick={() => {
                  setSelectedDate(date);
                  const [fromDate, toDate] = getDateRange(date, selectedRange);
                  onDateClick(fromDate.getTime(), toDate.getTime());
                }}
              >
                {formatDate(date, selectedRange)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
