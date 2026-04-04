import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { useAnimeDetail } from "../hooks/useAnime";
import { useEpisodes } from "../hooks/useEpisodes";
import { useAnimeHistory } from "../hooks/useWatchHistory";
import AnimeCard from "../components/AnimeCard";
import EpisodeList from "../components/EpisodeList";
import WatchlistButton from "../components/WatchlistButton";

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatSource(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatAired(
  startDate: { year: number | null; month: number | null; day: number | null } | null,
  endDate: { year: number | null; month: number | null; day: number | null } | null
): string | null {
  const fmt = (d: typeof startDate) => {
    if (!d?.year) return null;
    if (d.month && d.day) return `${d.month}/${d.day}/${d.year}`;
    if (d.month) return `${d.month}/${d.year}`;
    return String(d.year);
  };
  const start = fmt(startDate);
  const end = fmt(endDate);
  if (start && end && start !== end) return `${start} – ${end}`;
  if (start) return start;
  return null;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

const ANIME_RELATIONS = new Set(["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "SPIN_OFF", "ALTERNATIVE"]);

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
        <div className="h-80 bg-[#111118] w-full" />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          <div className="w-52 h-72 rounded-xl bg-[#111118] shrink-0" />
          <div className="flex-1 flex flex-col gap-4 pt-8">
            <div className="h-9 w-2/3 rounded bg-[#111118]" />
            <div className="h-4 w-1/3 rounded bg-[#111118]" />
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 w-16 rounded-full bg-[#111118]" />)}
            </div>
            <div className="flex gap-3 mt-3">
              <div className="h-10 w-32 rounded-full bg-[#111118]" />
            </div>
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

  const trailer = anime.trailer?.site === "youtube" ? anime.trailer : null;

  const relations = (anime.relations?.edges ?? []).filter(
    (e) => e.node.type === "ANIME" && ANIME_RELATIONS.has(e.relationType)
  );

  const recommendations = anime.recommendations.nodes
    .filter((n) => n.mediaRecommendation !== null)
    .slice(0, 6);

  const firstEpisode = episodesData?.episodes[0];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="group relative h-72 md:h-96 overflow-hidden cursor-pointer">
        {anime.bannerImage ? (
          <>
            <img
              src={anime.bannerImage}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#0a0a0f]/50 to-[#0a0a0f]" />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(to bottom, ${anime.coverImage?.color ?? "#1e1e28"}88 0%, #0a0a0f 100%)`,
            }}
          />
        )}

        {/* Play button overlay — only shown when there's a banner and an episode to watch */}
        {anime.bannerImage && firstEpisode && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              to={`/watch?animeId=${anime.id}&episodeId=${encodeURIComponent(firstEpisode.id)}&ep=${firstEpisode.number}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-black/40 border-2 border-white/30 backdrop-blur-sm hover:bg-black/60 hover:border-white/50 hover:scale-110 transition-all duration-200"
              aria-label={`Watch ${title}`}
            >
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Hero: cover art + metadata */}
        <div className="flex gap-6 md:gap-8 -mt-32 md:-mt-44 relative z-10 mb-10">
          {/* Cover */}
          <div className="shrink-0">
            <img
              src={anime.coverImage?.large ?? anime.coverImage?.medium ?? ""}
              alt={title}
              className="w-36 md:w-52 rounded-xl shadow-2xl object-cover aspect-[3/4] border-2 border-[#1e1e28]"
              style={{
                boxShadow: anime.coverImage?.color
                  ? `0 8px 40px ${anime.coverImage.color}55`
                  : undefined,
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 pb-1 mt-auto min-w-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                {title}
              </h1>
              {anime.title.romaji && anime.title.romaji !== title && (
                <p className="text-[#5d6169] text-sm mt-1">{anime.title.romaji}</p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {anime.averageScore && (
                <div className="flex items-center gap-1.5 bg-primary-500/15 border border-primary-500/40 rounded-full px-3 py-1">
                  <svg className="w-3.5 h-3.5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-primary-300 font-bold text-sm">
                    {(anime.averageScore / 10).toFixed(1)}
                  </span>
                </div>
              )}
              {anime.format && (
                <span className="text-xs text-[#8e9099] bg-white/5 border border-[#2a2a38] px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {anime.format.replace(/_/g, " ")}
                </span>
              )}
              {season && (
                <span className="text-xs text-[#8e9099]">{season}</span>
              )}
            </div>

            {/* Genres */}
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

            {/* CTA */}
            <div className="flex gap-3 mt-1">
              {firstEpisode && (
                <Link
                  to={`/watch?animeId=${anime.id}&episodeId=${encodeURIComponent(firstEpisode.id)}&ep=${firstEpisode.number}`}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-bold text-sm px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-primary-500/20"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </Link>
              )}
              <WatchlistButton
                animeId={anime.id}
                animeTitle={title}
                animeCover={anime.coverImage?.large ?? anime.coverImage?.medium}
                format={anime.format}
                episodes={anime.episodes}
                score={anime.averageScore}
                status={anime.status}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Left column */}
          <div className="flex flex-col gap-10">
            {/* Synopsis */}
            {description && (
              <section>
                <SectionHeading>Synopsis</SectionHeading>
                <p className="text-[#bfc1c6] text-sm leading-relaxed">{description}</p>
              </section>
            )}

            {/* Trailer */}
            {trailer && (
              <section>
                <SectionHeading>Trailer</SectionHeading>
                <div className="rounded-xl overflow-hidden aspect-video bg-[#111118]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailer.id}`}
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </section>
            )}

            {/* Episodes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading className="mb-0">Episodes</SectionHeading>
                {(episodesData?.episodes.length ?? anime.episodes) ? (
                  <span className="text-sm text-[#5d6169]">
                    {episodesData?.episodes.length ?? anime.episodes} total
                  </span>
                ) : null}
              </div>
              <EpisodeList
                animeId={anime.id}
                episodes={episodesData?.episodes ?? []}
                watchedEpisodes={animeHistory ?? []}
                loading={episodesLoading}
                error={episodesError?.message}
              />
            </section>

            {/* Characters */}
            {anime.characters.edges.length > 0 && (
              <section>
                <SectionHeading>Characters</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {anime.characters.edges.map(({ node, role, voiceActors }) => {
                    const va = voiceActors?.[0];
                    return (
                      <div
                        key={node.id}
                        className="flex items-stretch bg-[#111118] border border-[#1e1e28] rounded-xl overflow-hidden"
                      >
                        {/* Character */}
                        <img
                          src={node.image.large ?? node.image.medium ?? ""}
                          alt={node.name.full}
                          className="w-14 h-[72px] object-cover shrink-0"
                        />
                        <div className="flex flex-col justify-center px-3 py-2 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{node.name.full}</p>
                          <p className="text-xs text-[#5d6169] capitalize mt-0.5">{role.toLowerCase()}</p>
                        </div>
                        {/* Voice Actor */}
                        {va && (
                          <>
                            <div className="flex flex-col justify-center px-3 py-2 text-right min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{va.name.full}</p>
                              <p className="text-xs text-[#5d6169] mt-0.5">Japanese</p>
                            </div>
                            <img
                              src={va.image.medium ?? ""}
                              alt={va.name.full}
                              className="w-14 h-[72px] object-cover shrink-0"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Relations */}
            {relations.length > 0 && (
              <section>
                <SectionHeading>Related Anime</SectionHeading>
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
                <SectionHeading>You Might Also Like</SectionHeading>
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
          <aside className="flex flex-col gap-4 text-sm">
            <div className="rounded-xl bg-[#111118] border border-[#1e1e28] p-5 flex flex-col gap-0">
              <InfoRow label="Format" value={anime.format ? anime.format.replace(/_/g, " ") : null} />
              <InfoRow label="Status" value={formatStatus(anime.status)} />
              <InfoRow label="Season" value={season ?? null} />
              <InfoRow label="Aired" value={formatAired(anime.startDate ?? null, anime.endDate ?? null)} />
              <InfoRow label="Duration" value={anime.duration ? `${anime.duration} min/ep` : null} />
              <InfoRow label="Episodes" value={anime.episodes?.toString() ?? null} />
              <InfoRow label="Studio" value={studio ?? null} />
              <InfoRow label="Source" value={formatSource(anime.source ?? null)} />
              <InfoRow
                label="Score"
                value={anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)} / 10` : null}
              />
              <InfoRow
                label="Popularity"
                value={anime.popularity ? `#${anime.popularity.toLocaleString()}` : null}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  children,
  className = "mb-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-bold text-white ${className}`}>{children}</h2>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2 py-3 border-b border-[#1e1e28] last:border-0">
      <span className="text-[#5d6169] shrink-0">{label}</span>
      <span className="text-[#bfc1c6] text-right font-medium">{value}</span>
    </div>
  );
}
