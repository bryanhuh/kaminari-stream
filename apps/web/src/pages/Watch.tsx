import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "urql";
import { ANIME_DETAIL_QUERY } from "../lib/anilist";
import { useStream } from "../hooks/useStream";
import { useEpisodes } from "../hooks/useEpisodes";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";

interface AnimeBasic {
  Media: {
    id: number;
    title: { romaji: string | null; english: string | null };
    coverImage: { medium: string | null } | null;
  };
}

export default function Watch() {
  const [searchParams] = useSearchParams();
  const animeId = Number(searchParams.get("animeId"));
  const episodeId = searchParams.get("episodeId");
  const episodeNumber = searchParams.get("ep");

  const [animeResult] = useQuery<AnimeBasic>({
    query: ANIME_DETAIL_QUERY,
    variables: { id: animeId },
    pause: !animeId,
  });

  const anime = animeResult.data?.Media;
  const title = anime?.title.english ?? anime?.title.romaji ?? "Unknown";

  const { data: streamData, isLoading: streamLoading, error: streamError } =
    useStream(episodeId);

  const { data: episodesData, isLoading: episodesLoading, error: episodesError } =
    useEpisodes(animeId, title !== "Unknown" ? title : null);

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
      {/* Back link */}
      <div className="flex items-center gap-3">
        <Link
          to={`/anime/${animeId}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to anime
        </Link>
        <span className="text-gray-600 text-sm">/</span>
        <span className="text-sm text-gray-300">{pageTitle}</span>
      </div>

      {/* Player */}
      <div className="w-full">
        {streamLoading && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center animate-pulse">
            <p className="text-gray-500 text-sm">Loading stream...</p>
          </div>
        )}
        {streamError && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-red-400 text-sm">Failed to load stream</p>
            <p className="text-gray-600 text-xs">{streamError.message}</p>
          </div>
        )}
        {streamData && (
          <VideoPlayer
            streamData={streamData}
            title={pageTitle}
          />
        )}
      </div>

      {/* Episode info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          {anime && (
            <Link
              to={`/anime/${animeId}`}
              className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
            >
              {title}
            </Link>
          )}
        </div>
      </div>

      {/* Episode list */}
      <section>
        <h2 className="text-base font-semibold text-white mb-3">Episodes</h2>
        <EpisodeList
          animeId={animeId}
          episodes={episodesData?.episodes ?? []}
          currentEpisodeId={episodeId ?? undefined}
          loading={episodesLoading}
          error={episodesError?.message}
        />
      </section>
    </div>
  );
}
