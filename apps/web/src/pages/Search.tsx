import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTrending, useAnimeSearch } from "../hooks/useAnime";
import AnimeGrid from "../components/AnimeGrid";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
      if (inputValue.trim()) {
        setSearchParams({ q: inputValue.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [inputValue, setSearchParams]);

  const isSearching = debouncedQuery.length > 0;

  const { data: searchData, isLoading: searchLoading, error: searchError } =
    useAnimeSearch(debouncedQuery, 1, 30);

  const { data: browseData, isLoading: browseLoading, error: browseError } =
    useTrending(1, 30);

  const items = isSearching
    ? (searchData?.Page.media ?? [])
    : (browseData?.Page.media ?? []);
  const loading = isSearching ? searchLoading : browseLoading;
  const error = isSearching ? searchError : browseError;
  const total = isSearching ? searchData?.Page.pageInfo?.total : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search input */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d6169] pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search anime titles..."
            autoFocus
            className="w-full bg-[#111118] text-white placeholder-[#5d6169] rounded-full pl-12 pr-5 py-3 text-base outline-none border border-[#2a2a38] focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSearching ? `Results for "${debouncedQuery}"` : "Browse All"}
          </h2>
          <div className="w-10 h-1 rounded-full bg-primary-500 mt-2" />
        </div>
        {total != null && !loading && (
          <span className="text-sm text-[#5d6169]">{total.toLocaleString()} titles</span>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">
          Error: {(error as Error).message}
        </p>
      )}

      {!loading && isSearching && items.length === 0 && (
        <p className="text-[#5d6169] text-sm">No results for "{debouncedQuery}"</p>
      )}

      <AnimeGrid items={items} loading={loading} skeletonCount={24} />
    </div>
  );
}
