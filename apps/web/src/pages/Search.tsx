import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "urql";
import { SEARCH_QUERY, TRENDING_QUERY } from "../lib/anilist";
import AnimeGrid from "../components/AnimeGrid";

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
    pageInfo: { total: number; hasNextPage: boolean };
    media: MediaItem[];
  };
}

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

  const [searchResult] = useQuery<PageResult>({
    query: SEARCH_QUERY,
    variables: { search: debouncedQuery, page: 1, perPage: 30 },
    pause: !isSearching,
  });

  const [browseResult] = useQuery<PageResult>({
    query: TRENDING_QUERY,
    variables: { page: 1, perPage: 30 },
    pause: isSearching,
  });

  const result = isSearching ? searchResult : browseResult;
  const items = result.data?.Page.media ?? [];
  const total = result.data?.Page.pageInfo.total;

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
        {total != null && !result.fetching && (
          <span className="text-sm text-gray-500">{total.toLocaleString()} titles</span>
        )}
      </div>

      {result.error && (
        <p className="text-red-400 text-sm mb-4">
          Error: {result.error.message}
        </p>
      )}

      {!result.fetching && isSearching && items.length === 0 && (
        <p className="text-gray-500 text-sm">No results for "{debouncedQuery}"</p>
      )}

      <AnimeGrid items={items} loading={result.fetching} skeletonCount={24} />
    </div>
  );
}
