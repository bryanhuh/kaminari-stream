import { useQuery } from "urql";
import { TRENDING_QUERY, POPULAR_QUERY } from "../lib/anilist";
import { useContinueWatching } from "../hooks/useWatchHistory";
import AnimeGrid from "../components/AnimeGrid";
import ContinueWatchingCard from "../components/ContinueWatchingCard";

interface MediaItem {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; medium: string | null; color: string | null } | null;
  averageScore: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
}

interface PageResult {
  Page: {
    media: MediaItem[];
  };
}

export default function Home() {
  const [trendingResult] = useQuery<PageResult>({
    query: TRENDING_QUERY,
    variables: { page: 1, perPage: 18 },
  });

  const [popularResult] = useQuery<PageResult>({
    query: POPULAR_QUERY,
    variables: { page: 1, perPage: 12 },
  });

  const { data: continueWatching } = useContinueWatching();
  const hasContinue = continueWatching && continueWatching.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-10">
      {/* Continue Watching */}
      {hasContinue && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {continueWatching.map((entry) => (
              <ContinueWatchingCard key={`${entry.animeId}-${entry.episodeId}`} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        {trendingResult.error && (
          <p className="text-red-400 text-sm">
            Failed to load trending: {trendingResult.error.message}
          </p>
        )}
        <AnimeGrid
          items={trendingResult.data?.Page.media ?? []}
          loading={trendingResult.fetching}
          skeletonCount={18}
        />
      </section>

      {/* Popular */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">All-Time Popular</h2>
        {popularResult.error && (
          <p className="text-red-400 text-sm">
            Failed to load popular: {popularResult.error.message}
          </p>
        )}
        <AnimeGrid
          items={popularResult.data?.Page.media ?? []}
          loading={popularResult.fetching}
          skeletonCount={12}
        />
      </section>
    </div>
  );
}
