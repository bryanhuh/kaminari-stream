import { Link } from "react-router-dom";
import {
  useTrending,
  usePopular,
  useRecentEpisodes,
  useSpotlight,
  useSeasonAnime,
} from "../hooks/useAnime";
import { useContinueWatching } from "../hooks/useWatchHistory";
import AnimeGrid from "../components/AnimeGrid";
import AnimeCard from "../components/AnimeCard";
import RecentEpisodeCard from "../components/RecentEpisodeCard";
import HeroSpotlight from "../components/HeroSpotlight";
import ScheduleSection from "../components/ScheduleSection";
import PromoSection from "../components/PromoSection";
import GitHubStarBanner from "../components/GitHubStarBanner";
import ContinueWatchingBanner from "../components/ContinueWatchingBanner";
import type { MediaItem } from "../hooks/useAnime";

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

function AnimeScrollRow({ items, loading, skeletonCount = 8, cardWidth = "w-44" }: {
  items: MediaItem[];
  loading: boolean;
  skeletonCount?: number;
  cardWidth?: string;
}) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={`shrink-0 ${cardWidth}`}>
            <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
            <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
      {items.map((anime) => (
        <div key={anime.id} className={`shrink-0 ${cardWidth}`}>
          <AnimeCard
            id={anime.id}
            title={anime.title.english ?? anime.title.romaji ?? ""}
            coverImage={anime.coverImage?.large ?? anime.coverImage?.medium ?? null}
            score={anime.averageScore}
            format={anime.format}
            status={anime.status}
            episodes={anime.episodes}
            color={anime.coverImage?.color}
          />
        </div>
      ))}
    </div>
  );
}

function getCurrentSeasonLabel() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const season =
    month <= 3 ? "Winter" : month <= 6 ? "Spring" : month <= 9 ? "Summer" : "Fall";
  return `${season} ${year}`;
}

export default function Home() {
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useTrending(1, 18);
  const { data: popularData, isLoading: popularLoading } = usePopular(1, 16);
  const { data: seasonData, isLoading: seasonLoading } = useSeasonAnime();
  const { data: continueWatching } = useContinueWatching();
  const hasContinue = continueWatching && continueWatching.length > 0;
  const { data: recentData, isLoading: recentLoading } = useRecentEpisodes();
  const { data: spotlightData, isLoading: spotlightLoading } = useSpotlight();

  const seasonLabel = getCurrentSeasonLabel();

  return (
    <div className="flex flex-col">

      {/* 1 ── FULL-WIDTH HERO */}
      {spotlightLoading && (
        <div className="w-full bg-[#111118] animate-pulse" style={{ minHeight: "600px" }} />
      )}
      {!spotlightLoading && spotlightData && spotlightData.results.length > 0 && (
        <HeroSpotlight items={spotlightData.results} />
      )}

      {/* 2 ── GITHUB STAR BANNER */}
      <GitHubStarBanner />

      {/* 3 ── FULL-WIDTH RECENT EPISODES STRIP */}
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
        {recentLoading ? (
          <div className="flex gap-3 px-6 overflow-x-auto pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="shrink-0 w-40">
                <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
                <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 px-6 overflow-x-auto pb-2 scrollbar-thin">
            {recentData?.results.map((ep) => (
              <RecentEpisodeCard key={`${ep.id}-${ep.episodeNumber}`} episode={ep} />
            ))}
          </div>
        )}
      </section>

      {/* 4 ── CONTINUE WATCHING BANNER (full-width, only if history exists) */}
      {hasContinue && <ContinueWatchingBanner entries={continueWatching} />}

      {/* 5 ── FULL-WIDTH THIS SEASON (larger cards) */}
      <section className="w-full py-8 border-b border-[#1e1e28]">
        <div className="flex items-center justify-between px-6 mb-5">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            This Season
            <span className="ml-2 text-base font-medium text-[#5d6169]">{seasonLabel}</span>
          </h2>
          <Link
            to="/browse?category=ongoing"
            className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {seasonLoading ? (
          <div className="flex gap-4 px-6 overflow-x-auto pb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="shrink-0 w-52">
                <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
                <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 px-6 overflow-x-auto pb-2 scrollbar-thin">
            {(seasonData?.Page.media ?? []).map((anime) => (
              <div key={(anime as MediaItem).id} className="shrink-0 w-52">
                <AnimeCard
                  id={(anime as MediaItem).id}
                  title={(anime as MediaItem).title.english ?? (anime as MediaItem).title.romaji ?? ""}
                  coverImage={(anime as MediaItem).coverImage?.large ?? (anime as MediaItem).coverImage?.medium ?? null}
                  score={(anime as MediaItem).averageScore}
                  format={(anime as MediaItem).format}
                  status={(anime as MediaItem).status}
                  episodes={(anime as MediaItem).episodes}
                  color={(anime as MediaItem).coverImage?.color}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6 ── FULL-WIDTH FEATURED TITLE PROMO */}
      {trendingData && trendingData.Page.media.length > 0 && (
        <PromoSection anime={trendingData.Page.media[0] as MediaItem} loading={trendingLoading} />
      )}
      {trendingLoading && <PromoSection anime={null as never} loading={true} />}

      {/* 7 ── CONTAINED: TRENDING NOW */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-12 flex flex-col gap-14">
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
      </div>

      {/* 8 ── CONTAINED: SCHEDULE (between Trending and Popular) */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-14">
        <ScheduleSection />
      </div>

      {/* 9 ── CONTAINED: ALL-TIME POPULAR (horizontal row) */}
      <div className="max-w-7xl mx-auto px-6 w-full py-14">
        <SectionHeader title="All-Time Popular" viewAllHref="/browse?category=popular" />
        <AnimeScrollRow
          items={popularData?.Page.media ?? []}
          loading={popularLoading}
          skeletonCount={10}
          cardWidth="w-44"
        />
      </div>

    </div>
  );
}
