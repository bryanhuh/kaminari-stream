import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Episode, WatchHistoryEntry } from "@anime-app/types";

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  currentEpisodeId?: string;
  watchedEpisodes?: WatchHistoryEntry[];
  loading?: boolean;
  error?: string;
}

const ITEM_HEIGHT = 36; // h-9
const GAP = 8; // gap-2
const ROW_HEIGHT = ITEM_HEIGHT + GAP;
const MAX_VISIBLE_ROWS = 8;

function getColCount(width: number): number {
  if (width >= 768) return 10;
  if (width >= 640) return 8;
  return 6;
}

function getProgress(
  episodeId: string,
  watched: WatchHistoryEntry[]
): { pct: number; done: boolean } | null {
  const entry = watched.find((e) => e.episodeId === episodeId);
  if (!entry || entry.durationSeconds <= 0) return null;
  const pct = entry.progressSeconds / entry.durationSeconds;
  return { pct, done: pct >= 0.95 };
}

export default function EpisodeList({
  animeId,
  episodes,
  currentEpisodeId,
  watchedEpisodes = [],
  loading,
  error,
}: EpisodeListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [colCount, setColCount] = useState(() =>
    typeof window !== "undefined" ? getColCount(window.innerWidth) : 10
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setColCount(getColCount(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowCount = Math.ceil(episodes.length / colCount);
  const containerHeight = Math.min(rowCount, MAX_VISIBLE_ROWS) * ROW_HEIGHT - GAP;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 animate-pulse">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-9 rounded bg-gray-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-400">Could not load episodes: {error}</p>
    );
  }

  if (!episodes.length) {
    return <p className="text-sm text-gray-500">No episodes available.</p>;
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * colCount;
          const rowEpisodes = episodes.slice(startIdx, startIdx + colCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: ITEM_HEIGHT,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                gap: `${GAP}px`,
              }}
            >
              {rowEpisodes.map((ep) => {
                const isCurrent = ep.id === currentEpisodeId;
                const progress = getProgress(ep.id, watchedEpisodes);

                return (
                  <Link
                    key={ep.id}
                    to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.number}`}
                    className={`
                      relative flex items-center justify-center h-9 rounded text-sm font-medium
                      transition-colors overflow-hidden
                      ${
                        isCurrent
                          ? "bg-primary-600 text-[#0a0a0f]"
                          : progress?.done
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }
                    `}
                  >
                    {progress && !progress.done && !isCurrent && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 bg-primary-500"
                        style={{ width: `${Math.round(progress.pct * 100)}%` }}
                      />
                    )}
                    {ep.number}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
