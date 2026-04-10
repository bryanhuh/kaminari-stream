import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTrending, useAnimeSearch, type SearchFilters } from "../hooks/useAnime";
import AnimeGrid from "../components/AnimeGrid";
import { ANIME_GENRES } from "../components/GenreSelect";
import { usePageMeta } from "../hooks/usePageMeta";

const FORMATS = [
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
];

const STATUSES = [
  { value: "RELEASING", label: "Airing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "HIATUS", label: "Hiatus" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1939 }, (_, i) => currentYear + 1 - i);

// ── Dropdown component ────────────────────────────────────────────────────────

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
          value
            ? "border-primary-500 text-primary-400 bg-primary-500/10"
            : "border-[#2a2a38] text-[#bfc1c6] hover:border-[#3a3a4a] hover:text-white"
        }`}
      >
        {selected?.label || label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`absolute left-0 top-full mt-2 z-30 transition-all duration-200 ${
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}>
        <div className="bg-[#111118] border border-[#2a2a38] rounded-xl shadow-2xl py-1.5 min-w-[160px] max-h-72 overflow-y-auto">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              !value ? "text-white font-semibold" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            All {label}s
          </button>
          <div className="h-px bg-[#1e1e28] my-1" />
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === o.value
                  ? "text-primary-400 font-semibold bg-primary-500/10"
                  : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Search page ───────────────────────────────────────────────────────────────

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  usePageMeta(
    debouncedQuery ? `"${debouncedQuery}" — raijin.` : "Search Anime — raijin."
  );

  const [filters, setFilters] = useState<SearchFilters>({
    genre: searchParams.get("genre") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
    status: searchParams.get("status") ?? undefined,
  });

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (filters.genre) params.genre = filters.genre;
    if (filters.format) params.format = filters.format;
    if (filters.year) params.year = String(filters.year);
    if (filters.status) params.status = filters.status;
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, filters, setSearchParams]);

  // Debounce text input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(inputValue.trim()), 400);
    return () => clearTimeout(id);
  }, [inputValue]);

  const hasFilters = !!(filters.genre || filters.format || filters.year || filters.status);
  const isSearching = debouncedQuery.length > 0 || hasFilters;

  const { data: searchData, isLoading: searchLoading, error: searchError } =
    useAnimeSearch(debouncedQuery, 1, 30, filters);

  const { data: browseData, isLoading: browseLoading, error: browseError } =
    useTrending(1, 30);

  const items = isSearching
    ? (searchData?.Page.media ?? [])
    : (browseData?.Page.media ?? []);
  const loading = isSearching ? searchLoading : browseLoading;
  const error = isSearching ? searchError : browseError;
  const total = isSearching ? searchData?.Page.pageInfo?.total : undefined;

  const activeFilterCount = [filters.genre, filters.format, filters.year, filters.status].filter(Boolean).length;

  function clearFilters() {
    setFilters({});
  }

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search input */}
      <div className="mb-6">
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <FilterDropdown
          label="Genre"
          value={filters.genre ?? ""}
          options={ANIME_GENRES.map((g) => ({ value: g, label: g }))}
          onChange={(v) => updateFilter("genre", v)}
        />
        <FilterDropdown
          label="Format"
          value={filters.format ?? ""}
          options={FORMATS}
          onChange={(v) => updateFilter("format", v)}
        />
        <FilterDropdown
          label="Year"
          value={filters.year ? String(filters.year) : ""}
          options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
          onChange={(v) => updateFilter("year", v ? Number(v) : undefined)}
        />
        <FilterDropdown
          label="Status"
          value={filters.status ?? ""}
          options={STATUSES}
          onChange={(v) => updateFilter("status", v)}
        />
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#bfc1c6] hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSearching
              ? debouncedQuery
                ? `Results for "${debouncedQuery}"`
                : "Filtered Results"
              : "Browse All"}
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
        <p className="text-[#5d6169] text-sm">
          {debouncedQuery
            ? `No results for "${debouncedQuery}"`
            : "No results match the selected filters"}
        </p>
      )}

      <AnimeGrid items={items} loading={loading} skeletonCount={24} />
    </div>
  );
}
