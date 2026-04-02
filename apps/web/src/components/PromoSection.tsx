import { Link } from "react-router-dom";
import type { MediaItem } from "../hooks/useAnime";

interface PromoSectionProps {
  anime: MediaItem;
  loading?: boolean;
}

export default function PromoSection({ anime, loading }: PromoSectionProps) {
  if (loading) {
    return (
      <div className="w-full h-64 bg-[#111118] animate-pulse" />
    );
  }

  const title = anime.title.english ?? anime.title.romaji ?? "Unknown";
  const color = anime.coverImage?.color ?? "#00AEEF";
  const cover = anime.coverImage?.large ?? anime.coverImage?.medium;

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}22 0%, #0a0a0f 60%)` }}
    >
      {/* Subtle color wash layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(ellipse at 70% 50%, ${color}, transparent 70%)` }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 flex items-center justify-between gap-8">
        {/* Left: text content */}
        <div className="flex flex-col gap-4 max-w-lg">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em]">
            Featured Title
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {title}
          </h2>

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {anime.averageScore && (
              <span className="flex items-center gap-1 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            )}
            {anime.format && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a38] text-[#bfc1c6]">
                {anime.format}
              </span>
            )}
            {anime.episodes && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a38] text-[#bfc1c6]">
                {anime.episodes} episodes
              </span>
            )}
            {anime.status && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a38] text-[#bfc1c6] capitalize">
                {anime.status.replace(/_/g, " ").toLowerCase()}
              </span>
            )}
          </div>

          <Link
            to={`/anime/${anime.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-colors self-start shadow-lg"
            style={{ boxShadow: `0 8px 24px ${color}40` }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </Link>
        </div>

        {/* Right: cover art */}
        {cover && (
          <div className="shrink-0 relative hidden sm:block">
            {/* Glow behind cover */}
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-40 scale-95"
              style={{ background: color }}
            />
            <Link to={`/anime/${anime.id}`}>
              <img
                src={cover}
                alt={title}
                className="relative w-44 md:w-56 rounded-2xl object-cover aspect-[3/4] shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </div>
  );
}
