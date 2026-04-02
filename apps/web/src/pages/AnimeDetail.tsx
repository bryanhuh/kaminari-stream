import { useParams, Link } from "react-router-dom";
import { useAnimeDetail } from "../hooks/useAnime";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory } from "../hooks/useWatchHistory";
import AnimeCard from "../components/AnimeCard";
import EpisodeList from "../components/EpisodeList";

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useAnimeDetail(Number(id));

  const anime = data?.Media ?? null;
  const resolvedTitle = anime?.title.english ?? anime?.title.romaji ?? null;

  const { data: episodesData, isLoading: episodesLoading, error: episodesError } =
    useEpisodes(anime?.id ?? 0, resolvedTitle);

  const { data: animeHistory } = useAnimeHistory(anime?.id ?? 0);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-72 bg-[#111118] w-full" />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          <div className="w-48 h-72 rounded-xl bg-[#111118] shrink-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 w-2/3 rounded bg-[#111118]" />
            <div className="h-4 w-full rounded bg-[#111118]" />
            <div className="h-4 w-5/6 rounded bg-[#111118]" />
            <div className="h-4 w-4/6 rounded bg-[#111118]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">
          {(error as Error)?.message ?? "Anime not found"}
        </p>
        <Link to="/" className="text-primary-400 hover:underline mt-4 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  const title = resolvedTitle ?? "Unknown";
  const studio = anime.studios.nodes[0]?.name;
  const description = anime.description ? stripHtml(anime.description) : null;
  const season =
    anime.season && anime.seasonYear
      ? `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`
      : anime.seasonYear?.toString();

  const recommendations = anime.recommendations.nodes
    .filter((n) => n.mediaRecommendation !== null)
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Banner — taller, stronger gradient */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {anime.bannerImage ? (
          <>
            <img src={anime.bannerImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]" />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: anime.coverImage?.color ?? "#111118" }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Header — cover art overlapping banner */}
        <div className="flex gap-6 -mt-28 md:-mt-36 relative z-10 items-end mb-10">
          <img
            src={anime.coverImage?.large ?? anime.coverImage?.medium ?? ""}
            alt={title}
            className="w-36 md:w-52 rounded-xl shadow-2xl shrink-0 object-cover aspect-[3/4] border-2 border-[#1e1e28]"
          />
          <div className="pb-1 flex flex-col gap-2.5">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              {title}
            </h1>
            {anime.title.romaji && anime.title.romaji !== title && (
              <p className="text-[#5d6169] text-sm">{anime.title.romaji}</p>
            )}
            {/* Genre chips */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.slice(0, 5).map((g) => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a38] text-[#bfc1c6] bg-white/5"
                >
                  {g}
                </span>
              ))}
            </div>
            {/* Score pill */}
            {anime.averageScore && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {(anime.averageScore / 10).toFixed(1)}
                </div>
                <span className="text-xs text-[#5d6169]">/ 10</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          {/* Left column */}
          <div className="flex flex-col gap-10">
            {description && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Synopsis</h2>
                <p className="text-[#bfc1c6] text-sm leading-relaxed">{description}</p>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Episodes</h2>
                {(episodesData?.episodes.length ?? anime.episodes) && (
                  <span className="text-sm text-[#5d6169]">
                    {episodesData?.episodes.length ?? anime.episodes} total
                  </span>
                )}
              </div>
              <EpisodeList
                animeId={anime.id}
                episodes={episodesData?.episodes ?? []}
                watchedEpisodes={animeHistory ?? []}
                loading={episodesLoading}
                error={episodesError?.message}
              />
            </section>

            {anime.characters.edges.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4">Characters</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {anime.characters.edges.map(({ node, role }) => (
                    <div key={node.id} className="flex flex-col items-center gap-2 text-center">
                      <img
                        src={node.image.medium ?? ""}
                        alt={node.name.full}
                        className="w-16 h-16 rounded-full object-cover bg-[#111118] ring-2 ring-[#1e1e28]"
                      />
                      <p className="text-xs text-[#bfc1c6] leading-tight line-clamp-2">
                        {node.name.full}
                      </p>
                      <p className="text-xs text-[#5d6169] capitalize">{role.toLowerCase()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {recommendations.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4">You Might Also Like</h2>
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

          {/* Sidebar */}
          <aside className="flex flex-col gap-1 text-sm lg:pt-0">
            <div className="rounded-xl bg-[#111118] border border-[#1e1e28] p-5 flex flex-col gap-3.5">
              <InfoRow label="Format" value={anime.format} />
              <InfoRow label="Status" value={formatStatus(anime.status)} />
              <InfoRow label="Season" value={season ?? null} />
              <InfoRow label="Score" value={anime.averageScore ? `${anime.averageScore} / 100` : null} />
              <InfoRow label="Episodes" value={anime.episodes?.toString() ?? null} />
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
    <div className="flex justify-between gap-2 py-1 border-b border-[#1e1e28] last:border-0">
      <span className="text-[#5d6169]">{label}</span>
      <span className="text-[#bfc1c6] text-right font-medium">{value}</span>
    </div>
  );
}
