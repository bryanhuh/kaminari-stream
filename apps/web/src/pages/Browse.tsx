import { useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useInfiniteBrowseGenre, useInfiniteBrowseCategory } from "../hooks/useBrowse";
import { usePageMeta } from "../hooks/usePageMeta";
import { useInfiniteAZBrowse, useInfiniteRecentEpisodes } from "../hooks/useAnime";
import type { BrowseAnime } from "@anime-app/types";
import AnimeGrid from "../components/AnimeGrid";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Mecha", "Psychological", "Shounen",
  "Shoujo", "Seinen", "Isekai", "Historical", "Music", "School",
];

const TYPES = [
  { label: "TV Series", value: "TV" },
  { label: "Movie", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Special", value: "SPECIAL" },
];

type BrowseCategory = "genres" | "types" | "new-releases" | "updates" | "ongoing" | "recent" | "az";

function BrowseAnimeCard({ anime }: { anime: BrowseAnime }) {
  return (
    <div className="group flex flex-col gap-2.5">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-xs">No image</div>
        )}
        {anime.type && (
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-black/70 text-[#bfc1c6] px-1.5 py-0.5 rounded uppercase tracking-wide backdrop-blur-sm">
              {anime.type}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50">
          <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {anime.title}
        </p>
        <p className="text-xs text-[#5d6169] mt-0.5">
          {anime.sub > 0 && `Sub ${anime.sub}`}
          {anime.sub > 0 && anime.dub > 0 && " · "}
          {anime.dub > 0 && `Dub ${anime.dub}`}
        </p>
      </div>
    </div>
  );
}

function GenreGrid({ onSelect }: { onSelect: (g: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          className="px-4 py-2 rounded-full border border-[#2a2a38] text-sm text-[#bfc1c6] hover:border-primary-500 hover:text-white hover:bg-primary-500/10 transition-colors"
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function TypeGrid() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-3">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => navigate(`/search?q=&type=${t.value}`)}
          className="px-6 py-3 rounded-xl border border-[#2a2a38] text-sm font-semibold text-[#bfc1c6] hover:border-primary-500 hover:text-white hover:bg-primary-500/10 transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function BrowseGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i}>
          <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
          <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function LoadMoreSpinner() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Shared hook for sentinel-driven load-more
function useSentinel(
  sentinelRef: React.RefObject<HTMLDivElement | null>,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) {
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef, hasNextPage, isFetchingNextPage, fetchNextPage]);
}

function InfiniteBrowseGrid({
  items,
  loading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  items: BrowseAnime[];
  loading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  useSentinel(sentinelRef, hasNextPage, isFetchingNextPage, fetchNextPage);

  if (loading) return <BrowseGridSkeleton />;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {items.map((anime) => (
          <BrowseAnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
      <div ref={sentinelRef} className="mt-4">
        {isFetchingNextPage && <LoadMoreSpinner />}
      </div>
    </>
  );
}

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CATEGORY_LABELS: Record<BrowseCategory, string> = {
  genres: "Genres",
  types: "Types",
  "new-releases": "New Releases",
  updates: "Updates",
  ongoing: "Ongoing",
  recent: "Recent Episodes",
  az: "A–Z List",
};

export default function Browse() {
  usePageMeta("Browse Anime — raijin.", "Discover anime by genre, type, A–Z listing, and more on raijin.");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get("category") ?? "genres") as BrowseCategory;
  const genre = searchParams.get("genre");

  const isListCategory = category === "new-releases" || category === "ongoing" || category === "updates";
  const isGenreDrill = category === "genres" && !!genre;
  const azLetter = searchParams.get("letter") ?? "A";

  const genreQuery = useInfiniteBrowseGenre(isGenreDrill ? genre : null);
  const categoryQuery = useInfiniteBrowseCategory(
    isListCategory ? (category as "new-releases" | "ongoing" | "updates") : null
  );
  const azQuery = useInfiniteAZBrowse(category === "az" ? azLetter : "");
  const recentQuery = useInfiniteRecentEpisodes();

  function selectGenre(g: string) {
    setSearchParams({ category: "genres", genre: g });
  }

  const pageTitle = isGenreDrill
    ? genre!
    : category === "az"
    ? `A–Z List — ${azLetter}`
    : CATEGORY_LABELS[category];

  // Sentinel for A-Z (AnimeGrid items)
  const azSentinelRef = useRef<HTMLDivElement>(null);
  useSentinel(
    azSentinelRef,
    azQuery.hasNextPage,
    azQuery.isFetchingNextPage,
    azQuery.fetchNextPage
  );

  // Sentinel for Recent
  const recentSentinelRef = useRef<HTMLDivElement>(null);
  useSentinel(
    recentSentinelRef,
    recentQuery.hasNextPage,
    recentQuery.isFetchingNextPage,
    recentQuery.fetchNextPage
  );

  const azItems = azQuery.data?.pages.flatMap((p) => p.media) ?? [];
  const recentItems = recentQuery.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5d6169] mb-5">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        {isGenreDrill ? (
          <>
            <button
              onClick={() => setSearchParams({ category: "genres" })}
              className="hover:text-white transition-colors"
            >
              Genres
            </button>
            <span>/</span>
            <span className="text-[#bfc1c6]">{genre}</span>
          </>
        ) : (
          <span className="text-[#bfc1c6]">{pageTitle}</span>
        )}
      </div>

      {/* Page title with cyan underline accent */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{pageTitle}</h1>
        <div className="w-12 h-1 rounded-full bg-primary-500" />
      </div>

      {/* Genres category */}
      {category === "genres" && !genre && (
        <GenreGrid onSelect={selectGenre} />
      )}

      {/* Genre drill-down */}
      {isGenreDrill && (
        <InfiniteBrowseGrid
          items={genreQuery.data?.pages.flatMap((p) => p.results) ?? []}
          loading={genreQuery.isLoading}
          hasNextPage={genreQuery.hasNextPage}
          isFetchingNextPage={genreQuery.isFetchingNextPage}
          fetchNextPage={genreQuery.fetchNextPage}
        />
      )}

      {/* Types */}
      {category === "types" && <TypeGrid />}

      {/* List categories */}
      {isListCategory && (
        <InfiniteBrowseGrid
          items={categoryQuery.data?.pages.flatMap((p) => p.results) ?? []}
          loading={categoryQuery.isLoading}
          hasNextPage={categoryQuery.hasNextPage}
          isFetchingNextPage={categoryQuery.isFetchingNextPage}
          fetchNextPage={categoryQuery.fetchNextPage}
        />
      )}

      {/* A-Z */}
      {category === "az" && (
        <>
          {/* Letter picker */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {ALPHABET.map((l) => (
              <button
                key={l}
                onClick={() => setSearchParams({ category: "az", letter: l })}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                  l === azLetter
                    ? "bg-primary-500 text-[#0a0a0f] shadow-md shadow-primary-500/20"
                    : "bg-[#111118] text-[#bfc1c6] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a38]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <AnimeGrid
            items={azItems}
            loading={azQuery.isLoading}
            skeletonCount={18}
          />
          <div ref={azSentinelRef} className="mt-4">
            {azQuery.isFetchingNextPage && <LoadMoreSpinner />}
          </div>
        </>
      )}

      {/* Recent */}
      {category === "recent" && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {recentQuery.isLoading
              ? Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>
                    <div className="rounded-xl aspect-[3/4] bg-[#111118] animate-pulse" />
                    <div className="h-3 bg-[#111118] animate-pulse rounded mt-2 w-4/5" />
                  </div>
                ))
              : recentItems.map((ep) => {
                  const to = ep.anilistId
                    ? `/watch?animeId=${ep.anilistId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.episodeNumber}`
                    : "#";
                  return (
                    <Link key={`${ep.id}-${ep.episodeNumber}`} to={to} className="group flex flex-col gap-2.5">
                      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
                        {ep.image && (
                          <img src={ep.image} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50">
                          <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-xs bg-black/70 text-[#bfc1c6] px-1.5 py-0.5 rounded uppercase backdrop-blur-sm">{ep.subOrDub}</span>
                        </div>
                      </div>
                      <div className="px-0.5">
                        <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors">{ep.title}</p>
                        <p className="text-xs text-[#5d6169] mt-0.5">Episode {ep.episodeNumber}</p>
                      </div>
                    </Link>
                  );
                })}
          </div>
          <div ref={recentSentinelRef} className="mt-4">
            {recentQuery.isFetchingNextPage && <LoadMoreSpinner />}
          </div>
        </>
      )}
    </div>
  );
}
