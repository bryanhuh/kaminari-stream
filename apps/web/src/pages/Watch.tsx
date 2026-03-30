import { useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAnimeDetail } from "../hooks/useAnime";
import { useStream } from "../hooks/useStream";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory, useSaveProgress } from "../hooks/useWatchHistory";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";

const SAVE_INTERVAL_SEC = 5;

export default function Watch() {
  const [searchParams] = useSearchParams();
  const animeId = Number(searchParams.get("animeId"));
  const episodeId = searchParams.get("episodeId");
  const episodeNumber = searchParams.get("ep");

  const lastSavedAt = useRef<number>(0);

  const { data: animeData } = useAnimeDetail(animeId);

  const anime = animeData?.Media;
  const title = anime?.title.english ?? anime?.title.romaji ?? "Unknown";
  const cover = anime?.coverImage?.medium ?? null;

  const { data: streamData, isLoading: streamLoading, error: streamError } =
    useStream(episodeId);

  const { data: episodesData, isLoading: episodesLoading, error: episodesError } =
    useEpisodes(animeId, title !== "Unknown" ? title : null);

  const { data: animeHistory } = useAnimeHistory(animeId);

  const { mutate: saveProgress } = useSaveProgress();

  // Find saved progress for this episode to restore seek position
  const savedEntry = animeHistory?.find((e) => e.episodeId === episodeId);
  const initialTime =
    savedEntry && savedEntry.durationSeconds > 0
      ? savedEntry.progressSeconds
      : 0;

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

  if (!animeId || !episodeId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Invalid watch URL.</p>
        <Link to="/" className="text-indigo-400 hover:underline mt-2 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  const episodeTitle = episodeNumber ? `Episode ${episodeNumber}` : "Episode";
  const pageTitle = anime ? `${title} — ${episodeTitle}` : episodeTitle;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to={`/anime/${animeId}`} className="hover:text-white transition-colors">
          {title !== "Unknown" ? title : "Anime"}
        </Link>
        <span>/</span>
        <span className="text-gray-300">{episodeTitle}</span>
      </div>

      {/* Player */}
      <div className="w-full">
        {streamLoading && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading stream...</p>
            </div>
          </div>
        )}
        {streamError && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-red-400 text-sm">Failed to load stream</p>
            <p className="text-gray-600 text-xs">{streamError.message}</p>
            <p className="text-gray-600 text-xs mt-1">
              Make sure Consumet is running: <code className="text-gray-500">docker compose up -d</code>
            </p>
          </div>
        )}
        {streamData && (
          <VideoPlayer
            streamData={streamData}
            title={pageTitle}
            initialTime={initialTime}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
      </div>

      {/* Episode info row */}
      <div>
        <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
        {savedEntry && savedEntry.durationSeconds > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Resumed from {formatTime(savedEntry.progressSeconds)}
          </p>
        )}
      </div>

      {/* Episode list */}
      <section>
        <h2 className="text-base font-semibold text-white mb-3">Episodes</h2>
        <EpisodeList
          animeId={animeId}
          episodes={episodesData?.episodes ?? []}
          currentEpisodeId={episodeId ?? undefined}
          watchedEpisodes={animeHistory ?? []}
          loading={episodesLoading}
          error={episodesError?.message}
        />
      </section>
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
