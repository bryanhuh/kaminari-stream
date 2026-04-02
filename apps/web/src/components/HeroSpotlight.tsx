import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import type { SpotlightAnime } from "@anime-app/types";

interface HeroSpotlightProps {
  items: SpotlightAnime[];
}

const AUTO_ADVANCE_MS = 6000;

export default function HeroSpotlight({ items }: HeroSpotlightProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setActive((i) => (i + 1) % items.length),
    [items.length]
  );
  const prev = useCallback(
    () => setActive((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [active, paused, next, items.length]);

  const current = items[active];
  if (!current) return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "600px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Banner images */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
        >
          <img
            src={item.banner}
            alt={item.title}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </div>
      ))}

      {/* Gradient overlays — cinematic bottom + left fade */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/60 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-16" style={{ minHeight: "600px" }}>
        <div className="max-w-lg">
          {/* Top meta */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
              #{active + 1} Spotlight
            </span>
            {current.type && (
              <>
                <span className="text-[#5d6169]">·</span>
                <span className="text-xs text-[#bfc1c6] uppercase tracking-wide">{current.type}</span>
              </>
            )}
            {current.releaseDate && (
              <>
                <span className="text-[#5d6169]">·</span>
                <span className="text-xs text-[#bfc1c6]">{current.releaseDate}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-1 drop-shadow-lg tracking-tight">
            {current.title}
          </h1>
          {current.japaneseTitle && (
            <p className="text-sm text-[#5d6169] mb-4">{current.japaneseTitle}</p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {current.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-[#bfc1c6] bg-white/5 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-[#bfc1c6] leading-relaxed line-clamp-3 mb-6 max-w-md">
            {current.description}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {current.anilistId ? (
              <Link
                to={`/anime/${current.anilistId}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-colors shadow-lg shadow-primary-500/20"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
            ) : null}

            {/* Sub/Dub counts */}
            <div className="flex items-center gap-3 text-xs text-[#bfc1c6]">
              {current.sub > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  Sub {current.sub} eps
                </span>
              )}
              {current.dub > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  Dub {current.dub} eps
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots — bottom center */}
        {items.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 h-2 bg-primary-500"
                    : "w-2 h-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
