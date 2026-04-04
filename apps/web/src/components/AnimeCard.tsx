import { Link } from "react-router-dom";
import WatchlistButton from "./WatchlistButton";

interface AnimeCardProps {
  id: number;
  title: string;
  coverImage: string | null;
  score: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  color?: string | null;
}

export default function AnimeCard({
  id,
  title,
  coverImage,
  score,
  format,
  status,
  episodes,
}: AnimeCardProps) {
  return (
    <Link to={`/anime/${id}`} className="group flex flex-col gap-2.5">
      {/* Cover image */}
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-sm">
            No image
          </div>
        )}

        {/* Hover overlay with play icon */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Watchlist icon button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WatchlistButton
            animeId={id}
            animeTitle={title}
            animeCover={coverImage}
            format={format}
            episodes={episodes}
            score={score}
            status={status}
            variant="icon"
          />
        </div>

        {/* Score badge */}
        {score && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary-500 text-[#0a0a0f] text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {(score / 10).toFixed(1)}
          </div>
        )}

        {/* Format badge */}
        {format && (
          <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-[#bfc1c6] px-1.5 py-0.5 rounded uppercase tracking-wide backdrop-blur-sm">
            {format}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {title}
        </p>
        {episodes && (
          <p className="text-xs text-[#5d6169]">{episodes} episodes</p>
        )}
      </div>
    </Link>
  );
}
