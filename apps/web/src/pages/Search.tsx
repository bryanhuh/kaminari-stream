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
      <div className="mb-6">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search anime titles..."
          autoFocus
          className="w-full max-w-lg bg-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {isSearching ? `Results for "${debouncedQuery}"` : "Browse All"}
        </h2>
        {total != null && !loading && (
          <span className="text-sm text-gray-500">{total.toLocaleString()} titles</span>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">
          Error: {(error as Error).message}
        </p>
      )}

      {!loading && isSearching && items.length === 0 && (
        <p className="text-gray-500 text-sm">No results for "{debouncedQuery}"</p>
      )}

      <AnimeGrid items={items} loading={loading} skeletonCount={24} />
    </div>
  );
}
