import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Episode, WatchHistoryEntry } from "@anime-app/types";

interface MobileEpisodeStripProps {
  animeId: number;
  episodes: Episode[];
  currentEpisodeId: string | null;
  watchHistory: WatchHistoryEntry[];
}

export default function MobileEpisodeStrip({
  animeId,
  episodes,
  currentEpisodeId,
  watchHistory,
}: MobileEpisodeStripProps) {
  const currentRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!currentRef.current) return;
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ inline: "center", behavior: "smooth" });
    }, 120);
    return () => clearTimeout(timer);
  }, [currentEpisodeId, episodes.length]);

  if (episodes.length === 0) return null;

  return (
    <div className="lg:hidden flex gap-2 overflow-x-auto py-2 scrollbar-none -mx-4 px-4">
      {episodes.map((ep) => {
        const isCurrent = ep.id === currentEpisodeId;
        const entry = watchHistory.find((w) => w.episodeId === ep.id);
        const pct =
          entry && entry.durationSeconds > 0
            ? entry.progressSeconds / entry.durationSeconds
            : 0;
        const isDone = pct >= 0.95;
        const isPartial = pct > 0 && !isDone;

        return (
          <Link
            key={ep.id}
            ref={isCurrent ? currentRef : undefined}
            to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.number}`}
            className={`relative shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors overflow-hidden ${
              isCurrent
                ? "bg-primary-500 text-[#0a0a0f] shadow-md shadow-primary-500/30"
                : isDone
                ? "bg-[#1e1e28] text-[#5d6169]"
                : "bg-[#1e1e28] text-[#bfc1c6] hover:bg-[#2a2a38]"
            }`}
          >
            {ep.number}
            {isPartial && !isCurrent && (
              <span
                className="absolute bottom-0 left-0 h-0.5 bg-primary-500"
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
