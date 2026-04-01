import { useTrending, usePopular, useRecentEpisodes } from "../hooks/useAnime";
import { useContinueWatching } from "../hooks/useWatchHistory";
import AnimeGrid from "../components/AnimeGrid";
import ContinueWatchingCard from "../components/ContinueWatchingCard";
import RecentEpisodeCard from "../components/RecentEpisodeCard";

export default function Home() {
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } =
    useTrending(1, 18);

  const { data: popularData, isLoading: popularLoading, error: popularError } =
    usePopular(1, 12);

  const { data: continueWatching } = useContinueWatching();
  const hasContinue = continueWatching && continueWatching.length > 0;

  const { data: recentData, isLoading: recentLoading } = useRecentEpisodes();

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

      {/* Recent Episodes */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recent Episodes</h2>
        {recentLoading && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="shrink-0 w-40">
                <div className="rounded-lg aspect-[3/4] bg-gray-800 animate-pulse" />
                <div className="h-3 bg-gray-800 animate-pulse rounded mt-2 w-4/5" />
                <div className="h-2.5 bg-gray-800 animate-pulse rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {!recentLoading && recentData && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {recentData.results.map((ep) => (
              <RecentEpisodeCard key={`${ep.id}-${ep.episodeNumber}`} episode={ep} />
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        {trendingError && (
          <p className="text-red-400 text-sm">
            Failed to load trending: {(trendingError as Error).message}
          </p>
        )}
        <AnimeGrid
          items={trendingData?.Page.media ?? []}
          loading={trendingLoading}
          skeletonCount={18}
        />
      </section>

      {/* Popular */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">All-Time Popular</h2>
        {popularError && (
          <p className="text-red-400 text-sm">
            Failed to load popular: {(popularError as Error).message}
          </p>
        )}
        <AnimeGrid
          items={popularData?.Page.media ?? []}
          loading={popularLoading}
          skeletonCount={12}
        />
      </section>
    </div>
  );
}
