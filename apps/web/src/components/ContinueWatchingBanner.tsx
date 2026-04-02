import { Link } from "react-router-dom";
import type { WatchHistoryEntry } from "@anime-app/types";

interface Props {
  entries: WatchHistoryEntry[];
}

export default function ContinueWatchingBanner({ entries }: Props) {
  const primary = entries[0];
  if (!primary) return null;

  const pct =
    primary.durationSeconds > 0
      ? Math.round((primary.progressSeconds / primary.durationSeconds) * 100)
      : 0;

  const watchUrl = `/watch?animeId=${primary.animeId}&episodeId=${encodeURIComponent(primary.episodeId)}&ep=${primary.episodeNumber}`;

  return (
    <div className="w-full relative overflow-hidden border-b border-[#1e1e28]">
      {/* Blurred cover as full-width background */}
      {primary.animeCover && (
        <>
          <img
            src={primary.animeCover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-20"
            aria-hidden
          />
        </>
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/80 to-[#0a0a0f]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 flex items-center justify-between gap-8">
        {/* Left: info */}
        <div className="flex flex-col gap-3 max-w-lg">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em]">
            Continue Watching
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
            {primary.animeTitle}
          </h2>

          <p className="text-sm text-[#bfc1c6]">Episode {primary.episodeNumber}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-3 max-w-xs">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[#5d6169] shrink-0">{pct}%</span>
          </div>

          <Link
            to={watchUrl}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-colors self-start shadow-lg shadow-primary-500/20 mt-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </Link>
        </div>

        {/* Right: cover art */}
        {primary.animeCover && (
          <div className="shrink-0 relative hidden sm:block">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 scale-90 bg-primary-500" />
            <Link to={`/anime/${primary.animeId}`}>
              <img
                src={primary.animeCover}
                alt={primary.animeTitle}
                className="relative w-36 md:w-44 rounded-2xl object-cover aspect-[3/4] shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        )}

        {/* Other entries — small thumbnails */}
        {entries.length > 1 && (
          <div className="hidden lg:flex flex-col gap-2 shrink-0 max-w-[180px]">
            <p className="text-xs text-[#5d6169] uppercase tracking-wider mb-1">Up Next</p>
            {entries.slice(1, 4).map((e) => (
              <Link
                key={`${e.animeId}-${e.episodeId}`}
                to={`/watch?animeId=${e.animeId}&episodeId=${encodeURIComponent(e.episodeId)}&ep=${e.episodeNumber}`}
                className="flex items-center gap-2.5 group"
              >
                {e.animeCover && (
                  <img
                    src={e.animeCover}
                    alt={e.animeTitle}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 group-hover:ring-1 ring-primary-500 transition-all"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                    {e.animeTitle}
                  </p>
                  <p className="text-xs text-[#5d6169]">Ep {e.episodeNumber}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
