import { Link } from "react-router-dom";
import type { Episode, WatchHistoryEntry } from "@anime-app/types";

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  currentEpisodeId?: string;
  watchedEpisodes?: WatchHistoryEntry[];
  loading?: boolean;
  error?: string;
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
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {episodes.map((ep) => {
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
                  ? "bg-primary-600 text-white"
                  : progress?.done
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
          >
            {/* Progress bar under the button */}
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
}
