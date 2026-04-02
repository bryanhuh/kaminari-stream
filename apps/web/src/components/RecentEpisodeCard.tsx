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
    <div className="group relative flex flex-col gap-2.5 shrink-0 w-40 cursor-pointer">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
        {episode.image ? (
          <img
            src={episode.image}
            alt={episode.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-xs">
            No image
          </div>
        )}
        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50">
          <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Episode number badge — bottom left */}
        <div className="absolute bottom-2 left-2">
          <span className="text-xs font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full shadow">
            EP {episode.episodeNumber}
          </span>
        </div>
        {/* Sub/Dub badge — top right */}
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-black/70 text-[#bfc1c6] px-1.5 py-0.5 rounded uppercase tracking-wide backdrop-blur-sm">
            {episode.subOrDub}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {episode.title}
        </p>
      </div>
    </div>
  );

  if (!watchUrl) return content;
  return <Link to={watchUrl}>{content}</Link>;
}
