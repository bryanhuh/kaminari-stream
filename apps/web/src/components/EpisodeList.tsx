import { Link } from "react-router-dom";
import type { Episode } from "@anime-app/types";

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  currentEpisodeId?: string;
  loading?: boolean;
  error?: string;
}

export default function EpisodeList({
  animeId,
  episodes,
  currentEpisodeId,
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
      <p className="text-sm text-red-400">
        Could not load episodes: {error}
      </p>
    );
  }

  if (!episodes.length) {
    return <p className="text-sm text-gray-500">No episodes available.</p>;
  }

  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {episodes.map((ep) => {
        const isCurrent = ep.id === currentEpisodeId;
        return (
          <Link
            key={ep.id}
            to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.number}`}
            className={`
              flex items-center justify-center h-9 rounded text-sm font-medium transition-colors
              ${
                isCurrent
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
          >
            {ep.number}
          </Link>
        );
      })}
    </div>
  );
}
