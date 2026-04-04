import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Episode, WatchHistoryEntry } from "@anime-app/types";

interface WatchEpisodeSidebarProps {
  animeId: number;
  episodes: Episode[];
  currentEpisodeId: string | null;
  watchHistory: WatchHistoryEntry[];
  loading: boolean;
}

function getProgress(epId: string, watched: WatchHistoryEntry[]) {
  const e = watched.find((w) => w.episodeId === epId);
  if (!e || e.durationSeconds <= 0) return null;
  const pct = e.progressSeconds / e.durationSeconds;
  return { pct, done: pct >= 0.95 };
}

export default function WatchEpisodeSidebar({
  animeId,
  episodes,
  currentEpisodeId,
  watchHistory,
  loading,
}: WatchEpisodeSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!currentRef.current) return;
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => clearTimeout(timer);
  }, [currentEpisodeId, episodes.length]);

  return (
    <div className="hidden lg:flex flex-col bg-[#111118]/80 backdrop-blur-sm border border-[#1e1e28] rounded-xl overflow-hidden" style={{ maxHeight: "min(560px, calc((100vw - 300px - 4rem) * 9 / 16))" }}>
      <div className="px-4 py-3 border-b border-[#1e1e28] flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-white">Episodes</h3>
        {episodes.length > 0 && (
          <span className="text-xs text-[#5d6169]">{episodes.length} total</span>
        )}
      </div>

      <div ref={scrollRef} className="overflow-y-auto flex-1 p-2">
        {loading && (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[#1e1e28] animate-pulse" />
            ))}
          </div>
        )}
        {!loading && episodes.map((ep) => {
          const isCurrent = ep.id === currentEpisodeId;
          const progress = getProgress(ep.id, watchHistory);
          return (
            <Link
              key={ep.id}
              ref={isCurrent ? currentRef : undefined}
              to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.number}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                isCurrent
                  ? "bg-primary-500/15 border border-primary-500/30 text-white"
                  : "hover:bg-white/5 text-[#bfc1c6]"
              }`}
            >
              <span
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? "bg-primary-500 text-[#0a0a0f]"
                    : progress?.done
                    ? "bg-[#2a2a38] text-[#5d6169]"
                    : "bg-[#1e1e28] text-[#bfc1c6]"
                }`}
              >
                {ep.number}
              </span>
              <span className="truncate flex-1 text-xs">
                {ep.title ? ep.title : `Episode ${ep.number}`}
              </span>
              {progress?.done && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5d6169] shrink-0" />
              )}
              {progress && !progress.done && (
                <span className="w-1 h-4 bg-[#1e1e28] rounded-full overflow-hidden shrink-0">
                  <span
                    className="block w-full bg-primary-500 rounded-full"
                    style={{ height: `${progress.pct * 100}%` }}
                  />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
