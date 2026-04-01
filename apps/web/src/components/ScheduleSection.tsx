import { useState } from "react";
import { Link } from "react-router-dom";
import { useSchedule } from "../hooks/useBrowse";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function dayLabel(offset: number, date: Date): string {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  if (offset === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const DAY_OFFSETS = [-2, -1, 0, 1, 2];

export default function ScheduleSection() {
  const [offset, setOffset] = useState(0);

  const baseDate = new Date();
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + offset);
  const dateStr = formatDate(targetDate);

  const { data: items, isLoading } = useSchedule(dateStr);

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary-500 shrink-0" />
        Schedule
      </h2>

      {/* Day picker */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {DAY_OFFSETS.map((d) => {
          const d_date = new Date();
          d_date.setDate(d_date.getDate() + d);
          const active = d === offset;
          return (
            <button
              key={d}
              onClick={() => setOffset(d)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {dayLabel(d, d_date)}
            </button>
          );
        })}
      </div>

      {/* Schedule list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : !items?.length ? (
        <p className="text-gray-500 text-sm">No schedule data for this day.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[...items]
            .sort((a, b) => a.airingTime.localeCompare(b.airingTime))
            .map((item) => (
              <Link
                key={item.id}
                to={`/browse?category=ongoing`}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-primary-500/40 transition-all"
              >
                <span className="text-primary-400 font-mono text-sm font-bold shrink-0 w-12">
                  {item.airingTime}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                    {item.title}
                  </p>
                  {item.japaneseTitle && item.japaneseTitle !== item.title && (
                    <p className="text-xs text-gray-600 truncate">{item.japaneseTitle}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 shrink-0">Ep {item.airingEpisode}</span>
              </Link>
            ))}
        </div>
      )}
    </section>
  );
}
