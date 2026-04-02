import { Link } from "react-router-dom";
import { useTrending, usePopular, useRecentEpisodes, useSpotlight } from "../hooks/useAnime";
import { useContinueWatching } from "../hooks/useWatchHistory";
import AnimeGrid from "../components/AnimeGrid";
import ContinueWatchingCard from "../components/ContinueWatchingCard";
import RecentEpisodeCard from "../components/RecentEpisodeCard";
import HeroSpotlight from "../components/HeroSpotlight";
import ScheduleSection from "../components/ScheduleSection";

function SectionHeader({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
        >
          View All
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } =
    useTrending(1, 18);

  const { data: popularData, isLoading: popularLoading, error: popularError } =
    usePopular(1, 12);

  const { data: continueWatching } = useContinueWatching();
  const hasContinue = continueWatching && continueWatching.length > 0;

  const { data: recentData, isLoading: recentLoading } = useRecentEpisodes();
  const { data: spotlightData, isLoading: spotlightLoading } = useSpotlight();

  return (
    <div className="flex flex-col">

      {/* ── FULL-WIDTH HERO ── */}
      {spotlightLoading && (
        <div className="w-full bg-[#111118] animate-pulse" style={{ minHeight: "600px" }} />
      )}
      {!spotlightLoading && spotlightData && spotlightData.results.length > 0 && (
        <HeroSpotlight items={spotlightData.results} />
      )}

      {/* ── FULL-WIDTH RECENT EPISODES STRIP (edge-to-edge, like Hidive's card row) ── */}
      <section className="w-full py-6 border-b border-[#1e1e28]">
        <div className="flex items-center justify-between px-6 mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Episodes</h2>
          <Link
            to="/browse?category=recent"
            className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {recentLoading && (
          <div className="flex gap-3 px-6 overflow-x-auto pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="shrink-0 w-44">
                <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
                <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
                <div className="h-2.5 bg-[#111118] animate-pulse rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {!recentLoading && recentData && (
          <div className="flex gap-3 px-6 overflow-x-auto pb-2 scrollbar-thin">
            {recentData.results.map((ep) => (
              <RecentEpisodeCard key={`${ep.id}-${ep.episodeNumber}`} episode={ep} />
            ))}
          </div>
        )}
      </section>

      {/* ── CONTAINED SECTIONS ── */}
      <div className="max-w-7xl mx-auto px-6 w-full py-12 flex flex-col gap-14">

        {/* Continue Watching */}
        {hasContinue && (
          <section>
            <SectionHeader title="Continue Watching" />
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {continueWatching.map((entry) => (
                <ContinueWatchingCard key={`${entry.animeId}-${entry.episodeId}`} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Schedule */}
        <ScheduleSection />

        {/* Trending */}
        <section>
          {trendingError && (
            <p className="text-red-400 text-sm mb-3">
              Failed to load trending: {(trendingError as Error).message}
            </p>
          )}
          <SectionHeader title="Trending Now" viewAllHref="/browse?category=trending" />
          <AnimeGrid
            items={trendingData?.Page.media ?? []}
            loading={trendingLoading}
            skeletonCount={18}
          />
        </section>

        {/* Popular */}
        <section>
          {popularError && (
            <p className="text-red-400 text-sm mb-3">
              Failed to load popular: {(popularError as Error).message}
            </p>
          )}
          <SectionHeader title="All-Time Popular" viewAllHref="/browse?category=popular" />
          <AnimeGrid
            items={popularData?.Page.media ?? []}
            loading={popularLoading}
            skeletonCount={12}
          />
        </section>
      </div>
    </div>
  );
}
