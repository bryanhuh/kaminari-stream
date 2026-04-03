import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useNavigate } from "react-router-dom";
import type { MediaItem } from "../hooks/useAnime";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrailerEntry {
  anime: MediaItem;
  videoId: string;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elId: string,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  loadVideoById(videoId: string): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function parseYouTubeId(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function loadYTScript(onReady: () => void) {
  if (window.YT?.Player) { onReady(); return; }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev?.(); onReady(); };
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

// ── Shared action buttons ─────────────────────────────────────────────────────

function HeroActions({
  animeId,
  muted,
  onToggleMute,
  showMute,
  trailers,
  currentIndex,
  onDotClick,
}: {
  animeId: number;
  muted: boolean;
  onToggleMute: () => void;
  showMute: boolean;
  trailers: TrailerEntry[];
  currentIndex: number;
  onDotClick: (i: number) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => navigate(`/anime/${animeId}`)}
        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors shadow"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        Play
      </button>
      <button
        onClick={() => navigate(`/anime/${animeId}`)}
        className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold text-sm rounded-lg hover:bg-white/30 border border-white/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        More Info
      </button>

      {trailers.length > 1 && (
        <div className="flex items-center gap-1.5 ml-1">
          {trailers.map((_, i) => (
            <button
              key={i}
              onClick={() => onDotClick(i)}
              aria-label={`Trailer ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-4 h-1.5 bg-primary-500" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {showMute && (
        <button
          onClick={onToggleMute}
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
  );
}

// ── Anime info header ─────────────────────────────────────────────────────────

function AnimeInfo({ anime }: { anime: MediaItem }) {
  const title = anime.title.english ?? anime.title.romaji ?? "Unknown";
  return (
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
  );
}

// ── Trailer playlist hero ─────────────────────────────────────────────────────

export function TrailerHero({ trailers }: { trailers: TrailerEntry[] }) {
  const uid = useId().replace(/:/g, "");
  const playerId = `yt-hero-${uid}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const playerRef = useRef<YTPlayer | null>(null);
  const indexRef = useRef(0);
  const mountedRef = useRef(true);
  const trailersRef = useRef(trailers);
  trailersRef.current = trailers;

  const advance = useCallback(() => {
    if (!mountedRef.current) return;
    const list = trailersRef.current;
    const next = (indexRef.current + 1) % list.length;
    indexRef.current = next;
    setCurrentIndex(next);
    playerRef.current?.loadVideoById(list[next].videoId);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!trailers.length) return;
    indexRef.current = 0;
    setCurrentIndex(0);

    function initPlayer() {
      if (!mountedRef.current || !document.getElementById(playerId)) return;
      playerRef.current?.destroy();
      playerRef.current = new window.YT.Player(playerId, {
        videoId: trailers[0].videoId,
        playerVars: { autoplay: 1, mute: 1, controls: 0, showinfo: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, playsinline: 1 },
        events: { onStateChange: (e) => { if (e.data === 0) advance(); } },
      });
    }

    loadYTScript(initPlayer);

    return () => {
      mountedRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailers]);

  function toggleMute() {
    setMuted((v) => {
      const next = !v;
      if (next) playerRef.current?.mute(); else playerRef.current?.unMute();
      return next;
    });
  }

  function jumpTo(i: number) {
    indexRef.current = i;
    setCurrentIndex(i);
    playerRef.current?.loadVideoById(trailers[i].videoId);
  }

  const current = trailers[currentIndex];
  if (!current) return null;

  return (
    <div className="relative w-full h-[62vh] min-h-[400px] overflow-hidden bg-[#0a0a0f] mb-8">
      <div className="absolute inset-0 scale-[1.04] pointer-events-none overflow-hidden">
        <div
          id={playerId}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "max(100vw, calc(100vh * 16 / 9))", height: "max(100vh, calc(100vw * 9 / 16))" }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-10 max-w-7xl mx-auto">
        <AnimeInfo anime={current.anime} />
        <HeroActions
          animeId={current.anime.id}
          muted={muted}
          onToggleMute={toggleMute}
          showMute
          trailers={trailers}
          currentIndex={currentIndex}
          onDotClick={jumpTo}
        />
      </div>
    </div>
  );
}

// ── Static fallback hero (banner image / color) ───────────────────────────────

export function StaticHero({ anime }: { anime: MediaItem }) {
  return (
    <div className="relative w-full h-[62vh] min-h-[400px] overflow-hidden bg-[#0a0a0f] mb-8">
      {anime.bannerImage ? (
        <img src={anime.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${anime.coverImage?.color ?? "#1a1a2e"} 0%, #0a0a0f 100%)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/20" />
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-10 max-w-7xl mx-auto">
        <AnimeInfo anime={anime} />
        <HeroActions
          animeId={anime.id}
          muted={false}
          onToggleMute={() => {}}
          showMute={false}
          trailers={[]}
          currentIndex={0}
          onDotClick={() => {}}
        />
      </div>
    </div>
  );
}
