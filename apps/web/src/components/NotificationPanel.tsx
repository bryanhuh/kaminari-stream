import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContinueWatching } from "../hooks/useWatchHistory";
import { useAnimeDetail, useGenreRecommendations, useNextSeason, useShows } from "../hooks/useAnime";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CoverStack({ covers, fallbackColor }: { covers: (string | null | undefined)[]; fallbackColor?: string }) {
  const shown = covers.filter(Boolean).slice(0, 3) as string[];
  if (!shown.length) {
    return (
      <div
        className="shrink-0 w-[68px] h-[56px] rounded-lg"
        style={{ background: fallbackColor ? `${fallbackColor}33` : "#1e1e28" }}
      />
    );
  }
  return (
    <div className="relative shrink-0" style={{ width: 68, height: 56 }}>
      {shown.map((src, i) => (
        <img
          key={i}
          src={src}
          className="absolute rounded-md object-cover border border-white/10"
          style={{
            width: 40,
            height: 56,
            left: i * 14,
            top: 0,
            zIndex: shown.length - i,
            opacity: 1 - i * 0.18,
          }}
        />
      ))}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-[#5d6169] shrink-0 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Continue watching
  const { data: history } = useContinueWatching();
  const historyItems = (history ?? []).slice(0, 3);
  const mostRecentId = historyItems[0]?.animeId;

  // Genre-based top picks — chain: most recent anime detail → genre → recommendations
  const { data: recentDetail } = useAnimeDetail(mostRecentId ?? 0);
  const topGenre = recentDetail?.Media?.genres?.[0];
  const { data: recsData } = useGenreRecommendations(topGenre);
  const { data: trendingData } = useShows(1, 6); // fallback when no history
  const topPickItems = recsData?.Page.media ?? trendingData?.Page.media ?? [];
  const topPickCovers = topPickItems.slice(0, 3).map((a) => a.coverImage?.large);

  // Currently airing
  const { data: airingData } = useShows(1, 6);
  const airingItems = airingData?.Page.media ?? [];
  const airingCovers = airingItems.slice(0, 3).map((a) => a.coverImage?.large);

  // Next season
  const { data: nextSeasonData } = useNextSeason(6);
  const nextSeasonItems = nextSeasonData?.Page.media ?? [];
  const nextSeasonCovers = nextSeasonItems.slice(0, 3).map((a) => a.coverImage?.large);
  const nextSeason = nextSeasonItems[0];
  const nextSeasonLabel = nextSeason?.season && nextSeason?.seasonYear
    ? `${nextSeason.season.charAt(0) + nextSeason.season.slice(1).toLowerCase()} ${nextSeason.seasonYear}`
    : "Coming Soon";

  // Close handlers
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-full mt-3 z-50 transition-all duration-200 ${
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      {/* Arrow */}
      <div className="absolute -top-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#2a2a38]" />

      <div className="w-[380px] bg-[#111118] border border-[#2a2a38] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1e1e28] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          <span className="text-xs text-[#5d6169]">For you</span>
        </div>

        <div className="max-h-[520px] overflow-y-auto">

          {/* ── Continue Watching ───────────────────────────────── */}
          {historyItems.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5d6169]">
                Continue Watching
              </p>
              {historyItems.map((entry) => {
                const to = `/watch?animeId=${entry.animeId}&episodeId=${encodeURIComponent(entry.episodeId)}&ep=${entry.episodeNumber}`;
                const pct = entry.durationSeconds > 0
                  ? Math.round((entry.progressSeconds / entry.durationSeconds) * 100)
                  : 0;
                return (
                  <button
                    key={entry.id}
                    onClick={() => go(to)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-[#1e1e28] text-left"
                  >
                    <div className="shrink-0 w-[72px] h-[48px] rounded-lg overflow-hidden bg-[#0a0a0f] relative">
                      {entry.animeCover
                        ? <img src={entry.animeCover} alt={entry.animeTitle} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#2a2a38]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                      }
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
                        <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight line-clamp-1">{entry.animeTitle}</p>
                      <p className="text-xs text-[#bfc1c6] mt-0.5">Episode {entry.episodeNumber} · {pct}%</p>
                      <p className="text-xs text-[#5d6169] mt-1">{timeAgo(entry.watchedAt)}</p>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Editorial cards ─────────────────────────────────── */}
          <div>
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5d6169]">
              Discover
            </p>

            {/* Top Picks */}
            <button
              onClick={() => go("/shows")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-[#1e1e28] text-left"
            >
              <CoverStack covers={topPickCovers} fallbackColor="#00AEEF" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Your Top Picks</p>
                <p className="text-xs text-[#bfc1c6] mt-0.5 line-clamp-1">
                  {topGenre ? `Based on ${topGenre}` : "Trending recommendations"}
                </p>
                <p className="text-xs text-[#5d6169] mt-1">
                  {topPickItems.length > 0 ? `${topPickItems.length} anime` : "Explore now"}
                </p>
              </div>
              <ChevronRight />
            </button>

            {/* Now Airing */}
            <button
              onClick={() => go("/shows")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-[#1e1e28] text-left"
            >
              <CoverStack covers={airingCovers} fallbackColor="#7c3aed" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Now Airing</p>
                <p className="text-xs text-[#bfc1c6] mt-0.5">Currently releasing this season</p>
                <p className="text-xs text-[#5d6169] mt-1">
                  {airingItems.length > 0 ? `${airingData?.Page.pageInfo?.total ?? airingItems.length}+ anime airing` : "View schedule"}
                </p>
              </div>
              <ChevronRight />
            </button>

            {/* Anticipated Next Season */}
            <button
              onClick={() => go("/shows")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-[#1e1e28] text-left"
            >
              <CoverStack covers={nextSeasonCovers} fallbackColor="#d97706" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Anticipated Next Season</p>
                <p className="text-xs text-[#bfc1c6] mt-0.5">{nextSeasonLabel}</p>
                <p className="text-xs text-[#5d6169] mt-1">
                  {nextSeasonItems.length > 0 ? `${nextSeasonItems.length} titles announced` : "Coming soon"}
                </p>
              </div>
              <ChevronRight />
            </button>

            {/* Weekly Schedule */}
            <button
              onClick={() => go("/browse?category=schedule")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="shrink-0 w-[68px] h-[56px] rounded-lg flex items-center justify-center bg-[#05965622] border border-[#05965633]">
                <svg className="w-6 h-6 text-[#059656]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Weekly Schedule</p>
                <p className="text-xs text-[#bfc1c6] mt-0.5">This week's airing episodes</p>
                <p className="text-xs text-[#5d6169] mt-1">Updated daily</p>
              </div>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
