import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import type { WatchHistoryEntry } from "@anime-app/types";
import { useAnimeDetail } from "../hooks/useAnime";
import { useStream } from "../hooks/useStream";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory, useSaveProgress } from "../hooks/useWatchHistory";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";
import WatchEpisodeSidebar from "../components/WatchEpisodeSidebar";
import MobileEpisodeStrip from "../components/MobileEpisodeStrip";
import Comments from "../components/Comments";
import GitHubStarBanner from "../components/GitHubStarBanner";
import AnimeCard from "../components/AnimeCard";

const SAVE_INTERVAL_SEC = 5;
const AUTO_NEXT_KEY = "watchAutoNext";
const ANIME_RELATIONS = new Set(["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "SPIN_OFF", "ALTERNATIVE"]);

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

export default function Watch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const animeId = Number(searchParams.get("animeId"));
  const episodeId = searchParams.get("episodeId");
  const episodeNumber = searchParams.get("ep");

  const lastSavedAt = useRef<number>(0);

  const [autoNext, setAutoNext] = useState<boolean>(() => {
    const stored = localStorage.getItem(AUTO_NEXT_KEY);
    return stored === null ? true : stored === "true";
  });
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const [failedServers, setFailedServers] = useState<Set<number>>(new Set());

  // Reset source + failed servers when episode changes
  useEffect(() => {
    setSelectedSourceIndex(0);
    setFailedServers(new Set());
  }, [episodeId]);

  // Scroll to top on episode change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [episodeId]);

  const { data: animeData } = useAnimeDetail(animeId);
  const anime = animeData?.Media ?? null;
  const title = anime?.title.english ?? anime?.title.romaji ?? "Unknown";
  const cover = anime?.coverImage?.medium ?? null;

  const { data: streamData, isLoading: streamLoading, error: streamError } = useStream(episodeId);
  const { data: episodesData, isLoading: episodesLoading } = useEpisodes(
    animeId,
    title !== "Unknown" ? title : null
  );
  const { data: animeHistory } = useAnimeHistory(animeId);
  const { mutate: saveProgress } = useSaveProgress();

  const savedEntry = animeHistory?.find((e) => e.episodeId === episodeId);
  const initialTime = savedEntry && savedEntry.durationSeconds > 0 ? savedEntry.progressSeconds : 0;

  const episodes = episodesData?.episodes ?? [];
  const currentEpIndex = episodes.findIndex((ep) => ep.id === episodeId);
  const prevEp = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
  const nextEp =
    currentEpIndex >= 0 && currentEpIndex < episodes.length - 1
      ? episodes[currentEpIndex + 1]
      : null;

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!episodeId || !animeId || duration <= 0) return;
      if (currentTime - lastSavedAt.current < SAVE_INTERVAL_SEC) return;
      lastSavedAt.current = currentTime;
      saveProgress({
        animeId,
        episodeId,
        episodeNumber: Number(episodeNumber ?? 0),
        progressSeconds: currentTime,
        durationSeconds: duration,
        animeTitle: title,
        animeCover: cover,
        watchedAt: new Date().toISOString(),
      });
    },
    [animeId, episodeId, episodeNumber, title, cover, saveProgress]
  );

  const handleEnded = useCallback(() => {
    if (autoNext && nextEp) {
      navigate(`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(nextEp.id)}&ep=${nextEp.number}`);
    }
  }, [autoNext, nextEp, animeId, navigate]);

  // Track stream errors per server
  useEffect(() => {
    if (streamError) {
      setFailedServers((prev) => new Set([...prev, selectedSourceIndex]));
    }
  }, [streamError, selectedSourceIndex]);

  // Keyboard shortcuts: P = prev, N = next
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "p" || e.key === "P") {
        if (prevEp) navigate(`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(prevEp.id)}&ep=${prevEp.number}`);
      }
      if (e.key === "n" || e.key === "N") {
        if (nextEp) navigate(`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(nextEp.id)}&ep=${nextEp.number}`);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevEp, nextEp, animeId, navigate]);

  function toggleAutoNext() {
    const next = !autoNext;
    setAutoNext(next);
    localStorage.setItem(AUTO_NEXT_KEY, String(next));
  }

  if (!animeId || !episodeId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-[#8e9099]">Invalid watch URL.</p>
        <Link to="/" className="text-primary-400 hover:underline mt-2 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  const episodeTitle = episodeNumber ? `Episode ${episodeNumber}` : "Episode";
  const pageTitle = anime ? `${title} — ${episodeTitle}` : episodeTitle;
  const sourceUrl = streamData?.sources[selectedSourceIndex]?.url;

  const season =
    anime?.season && anime?.seasonYear
      ? `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`
      : anime?.seasonYear?.toString() ?? null;
  const studio = anime?.studios.nodes[0]?.name ?? null;
  const description = anime?.description ? stripHtml(anime.description) : null;

  const relations = (anime?.relations?.edges ?? []).filter(
    (e) => e.node.type === "ANIME" && ANIME_RELATIONS.has(e.relationType)
  );
  const recommendations = (anime?.recommendations.nodes ?? [])
    .filter((n) => n.mediaRecommendation !== null)
    .slice(0, 6);

  const bannerImage = anime?.bannerImage ?? null;
  const coverColor = anime?.coverImage?.color ?? null;

  return (
    <div className="min-h-screen">
      {/* ── ZONE A+B+C+D: Cinematic backdrop ─────────────────────────── */}
      <div className="relative w-full overflow-hidden">
        {/* Blurred banner background */}
        {bannerImage ? (
          <img
            src={bannerImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-[0.12] pointer-events-none select-none"
          />
        ) : coverColor ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${coverColor}30, #0a0a0f 70%)` }}
          />
        ) : null}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/70 to-[#0a0a0f]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 pt-4 pb-6 flex flex-col gap-3">
          {/* ZONE B: Now Playing bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-[#bfc1c6] hover:text-white transition-colors"
              aria-label="Go back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            {cover && (
              <img
                src={cover}
                alt={title}
                className="w-8 h-11 rounded-md object-cover border border-white/10 shrink-0"
              />
            )}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <Link
                to={`/anime/${animeId}`}
                className="text-sm font-semibold text-white hover:text-primary-400 transition-colors truncate leading-tight"
              >
                {title !== "Unknown" ? title : "Anime"}
              </Link>
              <span className="text-xs text-[#5d6169]">{episodeTitle}</span>
            </div>
          </div>

          {/* ZONE C: Player grid + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 lg:items-stretch">
            {/* Player */}
            <div className="min-w-0">
              {streamLoading && (
                <div className="w-full aspect-video bg-[#111118]/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-[#1e1e28]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#5d6169] text-sm">Loading stream...</p>
                  </div>
                </div>
              )}
              {streamError && !streamLoading && (
                <div className="w-full aspect-video bg-[#111118]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 border border-[#1e1e28]">
                  <svg className="w-12 h-12 text-[#2a2a38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
                  </svg>
                  <p className="text-white font-semibold">Stream unavailable</p>
                  <p className="text-[#5d6169] text-sm text-center max-w-xs px-4">
                    {streamError.message}
                  </p>
                  {streamData && streamData.sources.length > 1 && (
                    <p className="text-xs text-primary-400">Try switching to a different server below</p>
                  )}
                </div>
              )}
              {streamData && !streamError && (
                <VideoPlayer
                  streamData={streamData}
                  title={pageTitle}
                  initialTime={initialTime}
                  onTimeUpdate={handleTimeUpdate}
                  sourceUrl={sourceUrl}
                  onEnded={handleEnded}
                />
              )}
            </div>

            {/* Desktop episode sidebar */}
            <WatchEpisodeSidebar
              animeId={animeId}
              episodes={episodes}
              currentEpisodeId={episodeId}
              watchHistory={(animeHistory ?? []) as WatchHistoryEntry[]}
              loading={episodesLoading}
            />
          </div>

          {/* Mobile episode strip */}
          <MobileEpisodeStrip
            animeId={animeId}
            episodes={episodes}
            currentEpisodeId={episodeId}
            watchHistory={(animeHistory ?? []) as WatchHistoryEntry[]}
          />

          {/* ZONE D: Controls — compact bar attached under player */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Prev */}
              {prevEp ? (
                <Link
                  to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(prevEp.id)}&ep=${prevEp.number}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1e1e28] hover:bg-[#2a2a38] text-[#bfc1c6] hover:text-white text-xs font-medium transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111118] text-[#3a3a48] text-xs font-medium cursor-not-allowed">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </span>
              )}

              {/* AutoNext */}
              <button
                onClick={toggleAutoNext}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  autoNext
                    ? "bg-primary-500/20 border border-primary-500/40 text-primary-400"
                    : "bg-[#1e1e28] text-[#5d6169] hover:text-[#bfc1c6] border border-transparent"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Auto Next
              </button>

              {/* Next */}
              {nextEp ? (
                <Link
                  to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(nextEp.id)}&ep=${nextEp.number}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1e1e28] hover:bg-[#2a2a38] text-[#bfc1c6] hover:text-white text-xs font-medium transition-colors"
                >
                  Next
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111118] text-[#3a3a48] text-xs font-medium cursor-not-allowed">
                  Next
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}

              {/* Servers */}
              {streamData && streamData.sources.length > 0 && (
                <>
                  <span className="text-[#2a2a38] select-none px-0.5">|</span>
                  <span className="text-[10px] text-[#5d6169] font-bold tracking-widest uppercase">Servers</span>
                  {streamData.sources.map((source, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSourceIndex(idx)}
                      className={`relative flex flex-col items-center px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        selectedSourceIndex === idx
                          ? "bg-primary-500 text-[#0a0a0f] shadow-md shadow-primary-500/25"
                          : "bg-[#1e1e28] text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white"
                      }`}
                    >
                      Server {idx + 1}
                      {source.quality && (
                        <span className={`text-[9px] font-normal leading-none mt-0.5 ${selectedSourceIndex === idx ? "text-[#0a0a0f]/70" : "text-[#5d6169]"}`}>
                          {source.quality}
                        </span>
                      )}
                      {failedServers.has(idx) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-[#0a0a0f]" />
                      )}
                    </button>
                  ))}
                </>
              )}

              <span className="hidden md:flex ml-auto items-center gap-2 text-[10px] text-[#3a3a48]">
                <span>P prev</span>
                <span>·</span>
                <span>N next</span>
              </span>
            </div>

            {/* Episode count */}
            <p className="text-[11px] text-[#5d6169]">
              {episodeTitle}{episodes.length > 0 && ` of ${episodes.length}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── ZONE E: Below-fold content ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-12">

        {/* Episodes */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Episodes</h2>
          <EpisodeList
            animeId={animeId}
            episodes={episodes}
            currentEpisodeId={episodeId ?? undefined}
            watchedEpisodes={(animeHistory ?? []) as WatchHistoryEntry[]}
            loading={episodesLoading}
          />
        </section>

        {/* Synopsis & Details — AnimeKai style */}
        {anime && (
          <section className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="shrink-0">
              <img
                src={anime.coverImage?.large ?? anime.coverImage?.medium ?? ""}
                alt={title}
                className="w-40 sm:w-48 rounded-xl object-cover border border-[#1e1e28] shadow-lg"
                style={{ aspectRatio: "3/4" }}
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3 min-w-0 flex-1">
              {/* Title block */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-white leading-tight">{title}</h2>
                {anime.title.romaji && anime.title.romaji !== title && (
                  <p className="text-sm text-[#5d6169]">{anime.title.romaji}</p>
                )}
                {anime.title.native && (
                  <p className="text-sm text-[#5d6169]">{anime.title.native}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {anime.format && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 font-semibold uppercase tracking-wide">
                    {anime.format.replace(/_/g, " ")}
                  </span>
                )}
                {anime.status && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e28] border border-[#2a2a38] text-[#bfc1c6]">
                    {formatStatus(anime.status)}
                  </span>
                )}
                {season && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e28] border border-[#2a2a38] text-[#bfc1c6]">
                    {season}
                  </span>
                )}
                {anime.averageScore && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e28] border border-[#2a2a38] text-primary-400 font-semibold">
                    ★ {(anime.averageScore / 10).toFixed(1)}
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.slice(0, 6).map((g) => (
                  <span key={g} className="text-xs px-2 py-0.5 rounded-full border border-[#2a2a38] text-[#5d6169] hover:text-[#bfc1c6] hover:border-[#5d6169] transition-colors cursor-default">
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              {description && (
                <p className="text-[#bfc1c6] text-sm leading-relaxed line-clamp-4">{description}</p>
              )}

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-1">
                {[
                  { label: "Status", value: formatStatus(anime.status) },
                  { label: "Studio", value: studio },
                  { label: "Episodes", value: anime.episodes?.toString() ?? null },
                  { label: "Duration", value: anime.duration ? `${anime.duration} min` : null },
                  { label: "Season", value: season },
                  { label: "Format", value: anime.format ? anime.format.replace(/_/g, " ") : null },
                ]
                  .filter((r) => r.value)
                  .map((r) => (
                    <div key={r.label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d6169]">{r.label}</span>
                      <span className="text-sm text-[#bfc1c6] font-medium">{r.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Anime */}
        {relations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Related Anime</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {relations.map(({ relationType, node: rel }) => (
                <Link
                  key={rel.id}
                  to={`/anime/${rel.id}`}
                  className="flex flex-col gap-2 shrink-0 w-32 group"
                >
                  <div
                    className="relative rounded-lg overflow-hidden aspect-[3/4]"
                    style={{ backgroundColor: rel.coverImage.color ?? "#111118" }}
                  >
                    {rel.coverImage.medium && (
                      <img
                        src={rel.coverImage.medium}
                        alt={rel.title.english ?? rel.title.romaji ?? ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6">
                      <span className="text-[10px] text-[#bfc1c6] uppercase tracking-wider font-medium">
                        {relationType.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#bfc1c6] line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">
                    {rel.title.english ?? rel.title.romaji ?? ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">You Might Also Like</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {recommendations.map(({ mediaRecommendation: rec }) =>
                rec ? (
                  <AnimeCard
                    key={rec.id}
                    id={rec.id}
                    title={rec.title.english ?? rec.title.romaji ?? ""}
                    coverImage={rec.coverImage.medium}
                    score={rec.averageScore}
                    format={rec.format}
                    status={null}
                    episodes={null}
                    color={rec.coverImage.color}
                  />
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Comments */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Comments</h2>
          <Comments animeId={animeId} episodeId={episodeId ?? ""} />
        </section>

        {/* GitHub Star Banner */}
        <GitHubStarBanner />
      </div>
    </div>
  );
}
