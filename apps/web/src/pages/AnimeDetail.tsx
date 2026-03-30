import { useParams, Link } from "react-router-dom";
import { useQuery } from "urql";
import { ANIME_DETAIL_QUERY } from "../lib/anilist";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory } from "../hooks/useWatchHistory";
import AnimeCard from "../components/AnimeCard";
import EpisodeList from "../components/EpisodeList";

interface Character {
  role: string;
  node: {
    id: number;
    name: { full: string };
    image: { medium: string | null };
  };
}

interface Recommendation {
  mediaRecommendation: {
    id: number;
    title: { romaji: string | null; english: string | null };
    coverImage: { medium: string | null; color: string | null };
    averageScore: number | null;
    format: string | null;
  } | null;
}

interface AnimeDetailData {
  Media: {
    id: number;
    title: { romaji: string | null; english: string | null; native: string | null };
    description: string | null;
    coverImage: { large: string | null; medium: string | null; color: string | null } | null;
    bannerImage: string | null;
    episodes: number | null;
    status: string | null;
    season: string | null;
    seasonYear: number | null;
    averageScore: number | null;
    genres: string[];
    format: string | null;
    studios: { nodes: { id: number; name: string }[] };
    characters: { edges: Character[] };
    recommendations: { nodes: Recommendation[] };
  };
}

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();

  const [result] = useQuery<AnimeDetailData>({
    query: ANIME_DETAIL_QUERY,
    variables: { id: Number(id) },
    pause: !id,
  });

  const anime = result.data?.Media ?? null;
  const resolvedTitle = anime?.title.english ?? anime?.title.romaji ?? null;

  const { data: episodesData, isLoading: episodesLoading, error: episodesError } =
    useEpisodes(anime?.id ?? 0, resolvedTitle);

  const { data: animeHistory } = useAnimeHistory(anime?.id ?? 0);

  if (result.fetching) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-800 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          <div className="w-48 h-72 rounded-lg bg-gray-800 shrink-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 w-2/3 rounded bg-gray-800" />
            <div className="h-4 w-full rounded bg-gray-800" />
            <div className="h-4 w-5/6 rounded bg-gray-800" />
            <div className="h-4 w-4/6 rounded bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (result.error || !result.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">
          {result.error?.message ?? "Anime not found"}
        </p>
        <Link to="/" className="text-indigo-400 hover:underline mt-4 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  // After the early returns above, result.data is guaranteed non-null
  const animeData = result.data!.Media;
  const title = resolvedTitle ?? "Unknown";
  const studio = animeData.studios.nodes[0]?.name;
  const description = animeData.description ? stripHtml(animeData.description) : null;
  const season =
    animeData.season && animeData.seasonYear
      ? `${animeData.season.charAt(0) + animeData.season.slice(1).toLowerCase()} ${animeData.seasonYear}`
      : animeData.seasonYear?.toString();

  const recommendations = animeData.recommendations.nodes
    .filter((n) => n.mediaRecommendation !== null)
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {animeData.bannerImage ? (
          <>
            <img
              src={animeData.bannerImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: animeData.coverImage?.color ?? "#1f2937" }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Header row */}
        <div className="flex gap-6 -mt-24 md:-mt-32 relative z-10 items-end mb-8">
          <img
            src={animeData.coverImage?.large ?? animeData.coverImage?.medium ?? ""}
            alt={title}
            className="w-36 md:w-48 rounded-lg shadow-2xl shrink-0 object-cover aspect-[3/4]"
          />
          <div className="pb-1 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {title}
            </h1>
            {animeData.title.romaji && animeData.title.romaji !== title && (
              <p className="text-gray-400 text-sm">{animeData.title.romaji}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {animeData.genres.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* Description */}
            {description && (
              <section>
                <h2 className="text-base font-semibold text-white mb-2">Synopsis</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </section>
            )}

            {/* Episodes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Episodes</h2>
                {(episodesData?.episodes.length ?? animeData.episodes) && (
                  <span className="text-sm text-gray-500">
                    {episodesData?.episodes.length ?? animeData.episodes} total
                  </span>
                )}
              </div>
              <EpisodeList
                animeId={animeData.id}
                episodes={episodesData?.episodes ?? []}
                watchedEpisodes={animeHistory ?? []}
                loading={episodesLoading}
                error={episodesError?.message}
              />
            </section>

            {/* Characters */}
            {animeData.characters.edges.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-white mb-3">Characters</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {animeData.characters.edges.map(({ node, role }) => (
                    <div key={node.id} className="flex flex-col items-center gap-1 text-center">
                      <img
                        src={node.image.medium ?? ""}
                        alt={node.name.full}
                        className="w-16 h-16 rounded-full object-cover bg-gray-800"
                      />
                      <p className="text-xs text-gray-300 leading-tight line-clamp-2">
                        {node.name.full}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {role.toLowerCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-white mb-3">
                  You Might Also Like
                </h2>
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
              </section>
            )}
          </div>

          {/* Right column — info sidebar */}
          <aside className="flex flex-col gap-1 text-sm lg:pt-0">
            <div className="rounded-lg bg-gray-900 p-4 flex flex-col gap-3">
              <InfoRow label="Format" value={animeData.format} />
              <InfoRow label="Status" value={formatStatus(animeData.status)} />
              <InfoRow label="Season" value={season ?? null} />
              <InfoRow
                label="Score"
                value={animeData.averageScore ? `${animeData.averageScore} / 100` : null}
              />
              <InfoRow
                label="Episodes"
                value={animeData.episodes?.toString() ?? null}
              />
              <InfoRow label="Studio" value={studio ?? null} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 text-right">{value}</span>
    </div>
  );
}
