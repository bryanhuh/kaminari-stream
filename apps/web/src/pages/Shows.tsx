import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShows } from "../hooks/useAnime";
import AnimeGrid from "../components/AnimeGrid";
import type { MediaItem } from "../hooks/useAnime";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Mecha", "Psychological",
  "Shounen", "Shoujo", "Seinen", "Isekai", "Historical",
];

// ── Genre Dropdown ────────────────────────────────────────────────────────────

function GenreSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (g: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
          value
            ? "border-primary-500 text-primary-400 bg-primary-500/10"
            : "border-[#2a2a38] text-[#bfc1c6] hover:border-[#3a3a4a] hover:text-white bg-transparent"
        }`}
      >
        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A.75.75 0 0 1 4.5 5.25h15a.75.75 0 0 1 0 1.5h-15A.75.75 0 0 1 3.75 6Zm3 6A.75.75 0 0 1 7.5 11.25h9a.75.75 0 0 1 0 1.5h-9A.75.75 0 0 1 6.75 12Zm3 6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" />
        </svg>
        {value || "Genres"}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-full mt-2 z-30 transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-[#111118] border border-[#2a2a38] rounded-xl shadow-2xl py-1.5 min-w-[180px] max-h-72 overflow-y-auto">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              !value ? "text-white font-semibold" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            All Genres
          </button>
          <div className="h-px bg-[#1e1e28] my-1" />
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => { onChange(g); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === g
                  ? "text-primary-400 font-semibold bg-primary-500/10"
                  : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero Trailer ──────────────────────────────────────────────────────────────

function ShowsHero({ anime }: { anime: MediaItem }) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const title = anime.title.english ?? anime.title.romaji ?? "Unknown";
  const hasYouTube = anime.trailer?.site === "youtube" && !!anime.trailer.id;
  const videoId = anime.trailer?.id;

  return (
    <div className="relative w-full h-[62vh] min-h-[400px] overflow-hidden bg-[#0a0a0f] mb-8">
      {/* Background: YouTube iframe or banner image */}
      {hasYouTube ? (
        <>
          <div className="absolute inset-0 scale-[1.05]">
            <iframe
              key={muted ? "muted" : "unmuted"}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
              allow="autoplay; fullscreen"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: "max(100%, calc(100vh * 16 / 9))",
                height: "max(100%, calc(100vw * 9 / 16))",
                border: "none",
              }}
              title={title}
            />
          </div>
        </>
      ) : anime.bannerImage ? (
        <img
          src={anime.bannerImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${anime.coverImage?.color ?? "#1a1a2e"} 0%, #0a0a0f 100%)` }}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/20" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 max-w-7xl mx-auto">
        {/* Cover badge */}
        <div className="flex items-end gap-5 mb-5">
          {anime.coverImage?.large && (
            <img
              src={anime.coverImage.large}
              alt={title}
              className="hidden sm:block w-20 h-28 rounded-xl object-cover shadow-2xl border border-white/10 shrink-0"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {anime.format && (
                <span className="text-xs font-bold text-primary-400 bg-primary-500/15 border border-primary-500/30 px-2 py-0.5 rounded">
                  {anime.format}
                </span>
              )}
              {anime.averageScore && (
                <span className="text-xs font-semibold text-[#bfc1c6]">
                  ★ {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg line-clamp-2 max-w-xl">
              {title}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/anime/${anime.id}`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors shadow"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button
            onClick={() => navigate(`/anime/${anime.id}`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold text-sm rounded-lg hover:bg-white/30 border border-white/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            More Info
          </button>

          {/* Mute toggle — only shown when trailer is playing */}
          {hasYouTube && (
            <button
              onClick={() => setMuted((v) => !v)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="ml-auto flex items-center justify-center w-10 h-10 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-white hover:border-white/60 transition-colors"
            >
              {muted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Shows() {
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("");
  const { data, isLoading } = useShows(page, 24, genre || undefined);

  const items = data?.Page.media ?? [];
  const heroAnime = items[0] ?? null;
  const hasNext = data?.Page.pageInfo.hasNextPage ?? false;

  function handleGenreChange(g: string) {
    setGenre(g);
    setPage(1);
  }

  return (
    <div>
      {/* Hero — only on page 1 with no genre filter */}
      {!isLoading && heroAnime && page === 1 && (
        <ShowsHero anime={heroAnime} />
      )}

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-2 text-sm text-[#5d6169] mb-5">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#bfc1c6]">TV Shows</span>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              TV Shows{genre && <span className="text-primary-400"> — {genre}</span>}
            </h1>
            <div className="w-12 h-1 rounded-full bg-primary-500 mt-2" />
          </div>
          <GenreSelect value={genre} onChange={handleGenreChange} />
        </div>

        <AnimeGrid items={items} loading={isLoading} skeletonCount={24} />

        {!isLoading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 rounded-lg bg-[#1a1a24] text-sm font-medium text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#5d6169]">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="px-5 py-2 rounded-lg bg-[#1a1a24] text-sm font-medium text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
