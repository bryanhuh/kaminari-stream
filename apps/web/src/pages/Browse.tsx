import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useBrowseGenre, useBrowseCategory } from "../hooks/useBrowse";
import { useRecentEpisodes } from "../hooks/useAnime";
import type { BrowseAnime } from "@anime-app/types";

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

type BrowseCategory = "genres" | "types" | "new-releases" | "updates" | "ongoing" | "recent";

function BrowseAnimeCard({ anime }: { anime: BrowseAnime }) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-800">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
            {anime.type}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {anime.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
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
          className="px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-300 hover:border-indigo-500 hover:text-white hover:bg-indigo-500/10 transition-colors"
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
          className="px-6 py-3 rounded-lg border border-gray-700 text-sm font-semibold text-gray-300 hover:border-indigo-500 hover:text-white hover:bg-indigo-500/10 transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function AnimeGrid({ items, loading }: { items: BrowseAnime[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i}>
            <div className="rounded-lg aspect-[3/4] bg-gray-800 animate-pulse" />
            <div className="h-3 bg-gray-800 animate-pulse rounded mt-2 w-4/5" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {items.map((anime) => (
        <BrowseAnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}

const CATEGORY_LABELS: Record<BrowseCategory, string> = {
  genres: "Genres",
  types: "Types",
  "new-releases": "New Releases",
  updates: "Updates",
  ongoing: "Ongoing",
  recent: "Recent Episodes",
};

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get("category") ?? "genres") as BrowseCategory;
  const genre = searchParams.get("genre");

  const isListCategory = category === "new-releases" || category === "ongoing" || category === "updates";
  const isGenreDrill = category === "genres" && !!genre;

  const { data: categoryData, isLoading: categoryLoading } = useBrowseCategory(
    isListCategory ? (category as "new-releases" | "ongoing" | "updates") : null
  );

  const { data: genreData, isLoading: genreLoading } = useBrowseGenre(
    isGenreDrill ? genre : null
  );

  const { data: recentData, isLoading: recentLoading } = useRecentEpisodes();

  function selectGenre(g: string) {
    setSearchParams({ category: "genres", genre: g });
  }

  const pageTitle = isGenreDrill
    ? genre!
    : CATEGORY_LABELS[category];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
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
            <span className="text-gray-300">{genre}</span>
          </>
        ) : (
          <span className="text-gray-300">{pageTitle}</span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">{pageTitle}</h1>

      {/* Genres category */}
      {category === "genres" && !genre && (
        <GenreGrid onSelect={selectGenre} />
      )}

      {/* Genre drill-down */}
      {isGenreDrill && (
        <AnimeGrid items={genreData?.results ?? []} loading={genreLoading} />
      )}

      {/* Types */}
      {category === "types" && <TypeGrid />}

      {/* List categories */}
      {isListCategory && (
        <AnimeGrid items={categoryData?.results ?? []} loading={categoryLoading} />
      )}

      {/* Recent */}
      {category === "recent" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {recentLoading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i}>
                  <div className="rounded-lg aspect-[3/4] bg-gray-800 animate-pulse" />
                  <div className="h-3 bg-gray-800 animate-pulse rounded mt-2 w-4/5" />
                </div>
              ))
            : recentData?.results.map((ep) => {
                const to = ep.anilistId
                  ? `/watch?animeId=${ep.anilistId}&episodeId=${encodeURIComponent(ep.id)}&ep=${ep.episodeNumber}`
                  : "#";
                return (
                  <Link key={`${ep.id}-${ep.episodeNumber}`} to={to} className="group flex flex-col gap-2">
                    <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-800">
                      {ep.image && (
                        <img src={ep.image} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded uppercase">{ep.subOrDub}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">{ep.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Episode {ep.episodeNumber}</p>
                    </div>
                  </Link>
                );
              })}
        </div>
      )}
    </div>
  );
}
