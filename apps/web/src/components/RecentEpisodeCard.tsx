import { Link } from "react-router-dom";
import type { RecentEpisode } from "@anime-app/types";

interface RecentEpisodeCardProps {
  episode: RecentEpisode;
}

export default function RecentEpisodeCard({ episode }: RecentEpisodeCardProps) {
  const watchUrl = episode.anilistId
    ? `/watch?animeId=${episode.anilistId}&episodeId=${encodeURIComponent(episode.id)}&ep=${episode.episodeNumber}`
    : null;

  const content = (
    <div className="group relative flex flex-col gap-2 shrink-0 w-40 cursor-pointer">
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-800">
        {episode.image ? (
          <img
            src={episode.image}
            alt={episode.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
            {episode.subOrDub}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {episode.title}
        </p>
        <p className="text-xs text-gray-500">Episode {episode.episodeNumber}</p>
      </div>
    </div>
  );

  if (!watchUrl) return content;

  return <Link to={watchUrl}>{content}</Link>;
}
