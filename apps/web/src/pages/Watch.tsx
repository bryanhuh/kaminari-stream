import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import type { WatchHistoryEntry } from "@anime-app/types";
import { useAnimeDetail } from "../hooks/useAnime";
import { useStream } from "../hooks/useStream";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory, useSaveProgress } from "../hooks/useWatchHistory";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";
import Comments from "../components/Comments";
import GitHubStarBanner from "../components/GitHubStarBanner";
import AnimeCard from "../components/AnimeCard";

const SAVE_INTERVAL_SEC = 5;
const AUTO_NEXT_KEY = "watchAutoNext";
const ANIME_RELATIONS = new Set(["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "SPIN_OFF", "ALTERNATIVE"]);

type Tab = "episodes" | "details" | "comments";

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

function getProgress(epId: string, watched: WatchHistoryEntry[]) {
  const e = watched.find((w) => w.episodeId === epId);
  if (!e || e.durationSeconds <= 0) return null;
  const pct = e.progressSeconds / e.durationSeconds;
  return { pct, done: pct >= 0.95 };
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
  const [activeTab, setActiveTab] = useState<Tab>("episodes");

  // Reset source index when episode changes
  useEffect(() => {
    setSelectedSourceIndex(0);
  }, [episodeId]);

  const { data: animeData } = useAnimeDetail(animeId);
  const anime = animeData?.Media ?? null;
  const title = anime?.title.english ?? anime?.title.romaji ?? "Unknown";
  const cover = anime?.coverImage?.medium ?? null;

  const {
    data: streamData,
    isLoading: streamLoading,
    error: streamError,
  } = useStream(episodeId);

  const {
    data: episodesData,
    isLoading: episodesLoading,
  } = useEpisodes(animeId, title !== "Unknown" ? title : null);

  const { data: animeHistory } = useAnimeHistory(animeId);
  const { mutate: saveProgress } = useSaveProgress();

  const savedEntry = animeHistory?.find((e) => e.episodeId === episodeId);
  const initialTime =
    savedEntry && savedEntry.durationSeconds > 0 ? savedEntry.progressSeconds : 0;

  const episodes = episodesData?.episodes ?? [];
  const currentEpIndex = episodes.findIndex((ep) => ep.id === episodeId);
  const prevEp = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
  const nextEp = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1
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
      navigate(
        `/watch?animeId=${animeId}&episodeId=${encodeURIComponent(nextEp.id)}&ep=${nextEp.number}`
      );
    }
  }, [autoNext, nextEp, animeId, navigate]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5d6169]">
        <Link to={`/anime/${animeId}`} className="hover:text-white transition-colors">
          {title !== "Unknown" ? title : "Anime"}
        </Link>
        <span>/</span>
        <span className="text-[#bfc1c6]">{episodeTitle}</span>
      </div>

      {/* Player + Episode sidebar row */}
      <div className="flex gap-3 items-start">
        {/* Video player (flex-1) */}
        <div className="flex-1 min-w-0">
          {streamLoading && (
            <div className="w-full aspect-video bg-[#111118] rounded-xl flex items-center justify-center border border-[#1e1e28]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[#5d6169] text-sm">Loading stream...</p>
              </div>
            </div>
          )}
          {streamError && !streamLoading && (
            <div className="w-full aspect-video bg-[#111118] rounded-xl flex flex-col items-center justify-center gap-3 border border-[#1e1e28]">
              <svg className="w-12 h-12 text-[#2a2a38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
              </svg>
              <p className="text-white font-semibold">Stream unavailable</p>
              <p className="text-[#5d6169] text-sm text-center max-w-xs">
                {streamError.message} — Try switching to a different server above, or come back later.
              </p>
            </div>
          )}
          {streamData && (
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

        {/* Episode sidebar (hidden on mobile) */}
        <div
          className="hidden lg:flex flex-col bg-[#111118] border border-[#1e1e28] rounded-xl overflow-hidden lg:w-72 shrink-0"
          style={{ height: "calc(9/16 * (100vw - 320px - 2rem))" }}
        >
          <div className="px-4 py-3 border-b border-[#1e1e28]">
            <h3 className="text-sm font-semibold text-white">Episodes</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {episodes.map((ep) => {
              const isCurrent = ep.id === episodeId;
              const progress = getProgress(ep.id, animeHistory ?? []);
              return (
                <Link
                  key={ep.id}
                  to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.number}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                    isCurrent
                      ? "bg-primary-500/15 border border-primary-500/30 text-white"
                      : "hover:bg-white/5 text-[#bfc1c6]"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? "bg-primary-500 text-[#0a0a0f]"
                        : progress?.done
                        ? "bg-[#2a2a38] text-[#5d6169]"
                        : "bg-[#1e1e28] text-[#bfc1c6]"
                    }`}
                  >
                    {ep.number}
                  </span>
                  <span className="truncate flex-1">
                    {ep.title ? ep.title : `Episode ${ep.number}`}
                  </span>
                  {progress?.done && (
                    <span className="w-2 h-2 rounded-full bg-[#5d6169] shrink-0" />
                  )}
                  {progress && !progress.done && (
                    <span className="w-1 h-5 bg-[#1e1e28] rounded-full overflow-hidden shrink-0">
                      <span
                        className="block w-full bg-primary-500 rounded-full"
                        style={{ height: `${progress.pct * 100}%` }}
                      />
                    </span>
                  )}
                </Link>
              );
            })}
            {episodesLoading && (
              <p className="text-xs text-[#5d6169] p-3">Loading episodes...</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 flex flex-col gap-3">
        {/* Row 1: prev / autonext / next / servers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prev episode */}
          {prevEp ? (
            <Link
              to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(prevEp.id)}&ep=${prevEp.number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e28] hover:bg-[#2a2a38] text-[#bfc1c6] hover:text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e28] text-[#5d6169] text-sm font-medium cursor-not-allowed opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
          )}

          {/* AutoNext toggle */}
          <button
            onClick={toggleAutoNext}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              autoNext
                ? "bg-primary-500/15 border border-primary-500/30 text-primary-400"
                : "bg-[#1e1e28] text-[#5d6169] hover:text-[#bfc1c6]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Auto Next
          </button>

          {/* Next episode */}
          {nextEp ? (
            <Link
              to={`/watch?animeId=${animeId}&episodeId=${encodeURIComponent(nextEp.id)}&ep=${nextEp.number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e28] hover:bg-[#2a2a38] text-[#bfc1c6] hover:text-white text-sm font-medium transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e28] text-[#5d6169] text-sm font-medium cursor-not-allowed opacity-50"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Divider */}
          {streamData && streamData.sources.length > 0 && (
            <>
              <span className="text-[#2a2a38] mx-1 select-none">···</span>
              {/* Server selector */}
              {streamData.sources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSourceIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSourceIndex === idx
                      ? "bg-primary-500 text-[#0a0a0f]"
                      : "bg-[#1e1e28] text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white"
                  }`}
                >
                  {source.quality || `Server ${idx + 1}`}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Row 2: hint */}
        <p className="text-xs text-[#5d6169]">
          You are watching {episodeTitle} — If a server doesn't load, try another.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-0">
        {/* Tab bar */}
        <div className="flex border-b border-[#1e1e28]">
          {(["episodes", "details", "comments"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary-500 text-white -mb-px"
                  : "text-[#5d6169] hover:text-[#bfc1c6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-5">
          {/* Episodes tab */}
          {activeTab === "episodes" && (
            <section>
              <EpisodeList
                animeId={animeId}
                episodes={episodesData?.episodes ?? []}
                currentEpisodeId={episodeId ?? undefined}
                watchedEpisodes={animeHistory ?? []}
                loading={episodesLoading}
              />
            </section>
          )}

          {/* Details tab */}
          {activeTab === "details" && (
            <section className="flex flex-col gap-8">
              {!anime ? (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-32 h-44 rounded-xl bg-[#111118] shrink-0" />
                    <div className="flex-1 flex flex-col gap-3 pt-2">
                      <div className="h-6 w-2/3 rounded bg-[#111118]" />
                      <div className="h-4 w-full rounded bg-[#111118]" />
                      <div className="h-4 w-full rounded bg-[#111118]" />
                      <div className="h-4 w-3/4 rounded bg-[#111118]" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cover + title + synopsis */}
                  <div className="flex gap-5">
                    <div className="shrink-0">
                      <img
                        src={anime.coverImage?.large ?? anime.coverImage?.medium ?? ""}
                        alt={title}
                        className="w-28 rounded-xl object-cover aspect-[3/4] border border-[#1e1e28]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
                      {anime.title.romaji && anime.title.romaji !== title && (
                        <p className="text-xs text-[#5d6169]">{anime.title.romaji}</p>
                      )}
                      {/* Genres */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {anime.genres.slice(0, 5).map((g) => (
                          <span
                            key={g}
                            className="text-xs px-2 py-0.5 rounded-full border border-[#2a2a38] text-[#bfc1c6] bg-white/5"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      {description && (
                        <p className="text-sm text-[#bfc1c6] leading-relaxed mt-1 line-clamp-4">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 grid grid-cols-2 gap-x-6">
                    {[
                      { label: "Format", value: anime.format ? anime.format.replace(/_/g, " ") : null },
                      { label: "Status", value: formatStatus(anime.status) },
                      { label: "Season", value: season },
                      { label: "Studio", value: studio },
                      { label: "Score", value: anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)} / 10` : null },
                      { label: "Episodes", value: anime.episodes?.toString() ?? null },
                    ]
                      .filter((row) => row.value !== null)
                      .map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-2 py-2.5 border-b border-[#1e1e28] last:border-0 col-span-1"
                        >
                          <span className="text-xs text-[#5d6169]">{row.label}</span>
                          <span className="text-xs text-[#bfc1c6] font-medium text-right">{row.value}</span>
                        </div>
                      ))}
                  </div>

                  {/* Relations */}
                  {relations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">Related Anime</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                        {relations.map(({ relationType, node: rel }) => (
                          <Link
                            key={rel.id}
                            to={`/anime/${rel.id}`}
                            className="flex flex-col gap-2 shrink-0 w-28 group"
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
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">You Might Also Like</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
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
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Comments tab */}
          {activeTab === "comments" && (
            <Comments animeId={animeId} episodeId={episodeId ?? ""} />
          )}
        </div>
      </div>

      {/* GitHub Star Banner */}
      <GitHubStarBanner />
    </div>
  );
}
