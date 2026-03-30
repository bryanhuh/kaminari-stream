import { useTrending, usePopular } from "../hooks/useAnime";
import { useContinueWatching } from "../hooks/useWatchHistory";
import AnimeGrid from "../components/AnimeGrid";
import ContinueWatchingCard from "../components/ContinueWatchingCard";

export default function Home() {
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } =
    useTrending(1, 18);

  const { data: popularData, isLoading: popularLoading, error: popularError } =
    usePopular(1, 12);

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
