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
      className="relative w-full overflow-hidden rounded-xl"
      style={{ minHeight: "480px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Banner images — preload adjacent */}
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

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-12" style={{ minHeight: "480px" }}>
        <div className="max-w-xl">
          {/* Rank badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              #{active + 1} Spotlight
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">{current.type}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">{current.releaseDate}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1 drop-shadow-lg">
            {current.title}
          </h1>
          {current.japaneseTitle && (
            <p className="text-sm text-gray-400 mb-3">{current.japaneseTitle}</p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {current.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="text-xs px-2.5 py-0.5 rounded-full border border-white/20 text-gray-300 bg-white/5 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-5 max-w-lg">
            {current.description}
          </p>

          {/* Episode counts + CTA */}
          <div className="flex items-center gap-4">
            {current.anilistId ? (
              <Link
                to={`/anime/${current.anilistId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
            ) : null}

            <div className="flex items-center gap-3 text-xs text-gray-400">
              {current.sub > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Sub {current.sub} eps
                </span>
              )}
              {current.dub > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
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
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-5 right-8 z-30 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 h-1.5 bg-indigo-400"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
