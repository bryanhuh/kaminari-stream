import { Link } from "react-router-dom";
import type { WatchHistoryEntry } from "@anime-app/types";

interface ContinueWatchingCardProps {
  entry: WatchHistoryEntry;
}

export default function ContinueWatchingCard({ entry }: ContinueWatchingCardProps) {
  const pct =
    entry.durationSeconds > 0
      ? Math.min(entry.progressSeconds / entry.durationSeconds, 1)
      : 0;

  return (
    <Link
      to={`/watch?animeId=${entry.animeId}&episodeId=${encodeURIComponent(entry.episodeId)}&ep=${entry.episodeNumber}`}
      className="group relative flex flex-col gap-2.5 shrink-0 w-40"
    >
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
        {entry.animeCover ? (
          <img
            src={entry.animeCover}
            alt={entry.animeTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-xs">
            No image
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50">
          <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Progress bar — cyan, slightly taller for visibility */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {entry.animeTitle}
        </p>
        <p className="text-xs text-[#5d6169]">Episode {entry.episodeNumber}</p>
      </div>
    </Link>
  );
}
