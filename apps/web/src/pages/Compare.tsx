import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAnimeDetail } from "../hooks/useAnime";
import { useTitlePreference } from "../context/TitlePreferenceContext";
import { resolveTitle } from "../utils/title";

interface SearchHit {
  id: number;
  title: { romaji: string | null; english: string | null; native?: string | null };
  coverImage: { medium: string | null } | null;
  averageScore: number | null;
  format: string | null;
}

function useAnimeSearch(query: string) {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${base}/api/anime/search?q=${encodeURIComponent(query)}&perPage=6`);
        const json = await res.json();
        setResults((json.data?.Page?.media ?? []) as SearchHit[]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  return { results, loading };
}

interface PickerProps {
  label: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function AnimePicker({ label, selectedId, onSelect }: PickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, loading } = useAnimeSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pref } = useTitlePreference();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(id: number) {
    onSelect(id);
    setQuery("");
    setOpen(false);
  }

  if (selectedId) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <p className="text-xs font-bold uppercase tracking-widest text-[#5d6169] mb-2">{label}</p>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d6169] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search anime..."
          className="w-full bg-[#111118] text-sm text-white placeholder-[#5d6169] rounded-xl pl-9 pr-4 py-3 outline-none border border-[#1e1e28] focus:border-primary-500 transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-[#111118] border border-[#1e1e28] rounded-xl shadow-2xl overflow-hidden">
          {results.map((hit) => (
            <button
              key={hit.id}
              onClick={() => handleSelect(hit.id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              {hit.coverImage?.medium ? (
                <img src={hit.coverImage.medium} alt="" className="w-8 h-11 rounded object-cover shrink-0" />
              ) : (
                <div className="w-8 h-11 rounded bg-[#1e1e28] shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{resolveTitle(hit.title, pref)}</p>
                <p className="text-xs text-[#5d6169]">
                  {hit.format ?? "—"}{hit.averageScore ? ` · ${(hit.averageScore / 10).toFixed(1)}★` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatStatus(s: string | null) {
  if (!s) return null;
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").trim();
}

interface AnimeColumnProps {
  id: number;
  onClear: () => void;
}

function AnimeColumn({ id, onClear }: AnimeColumnProps) {
  const { data, isLoading } = useAnimeDetail(id);
  const { pref } = useTitlePreference();
  const anime = data?.Media ?? null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-[3/4] w-40 rounded-xl bg-[#111118] animate-pulse mx-auto" />
        <div className="h-6 rounded bg-[#111118] animate-pulse" />
        <div className="h-4 rounded bg-[#111118] animate-pulse w-3/4" />
        <div className="h-4 rounded bg-[#111118] animate-pulse" />
      </div>
    );
  }

  if (!anime) return null;

  const title = resolveTitle(anime.title, pref);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative group">
          <img
            src={anime.coverImage?.large ?? anime.coverImage?.medium ?? ""}
            alt={title}
            className="w-36 rounded-xl object-cover shadow-lg"
            style={{ aspectRatio: "3/4" }}
          />
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#1e1e28] border border-[#2a2a38] text-[#5d6169] hover:text-white hover:bg-[#2a2a38] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Clear"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Link to={`/anime/${anime.id}`} className="text-base font-bold text-white hover:text-primary-400 transition-colors leading-tight">
          {title}
        </Link>
        {anime.title.native && <p className="text-xs text-[#5d6169]">{anime.title.native}</p>}
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        {[
          { label: "Score", value: anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)} / 10` : "—" },
          { label: "Format", value: anime.format ?? "—" },
          { label: "Status", value: formatStatus(anime.status) ?? "—" },
          { label: "Episodes", value: anime.episodes ? String(anime.episodes) : "—" },
          { label: "Duration", value: anime.duration ? `${anime.duration} min` : "—" },
          { label: "Season", value: anime.season && anime.seasonYear ? `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}` : anime.seasonYear ? String(anime.seasonYear) : "—" },
          { label: "Studio", value: anime.studios.nodes[0]?.name ?? "—" },
          { label: "Source", value: anime.source ? anime.source.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase()) : "—" },
          { label: "Popularity", value: anime.popularity ? anime.popularity.toLocaleString() : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 py-2.5 border-b border-[#1e1e28]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5d6169]">{label}</span>
            <span className="text-sm font-semibold text-white">{value}</span>
          </div>
        ))}

        {/* Genres */}
        <div className="flex flex-col gap-1.5 py-2.5 border-b border-[#1e1e28]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5d6169]">Genres</span>
          <div className="flex flex-wrap gap-1">
            {anime.genres.length > 0
              ? anime.genres.map((g) => (
                  <span key={g} className="text-[11px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    {g}
                  </span>
                ))
              : <span className="text-sm text-[#5d6169]">—</span>
            }
          </div>
        </div>

        {/* Synopsis */}
        {anime.description && (
          <div className="flex flex-col gap-1.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5d6169]">Synopsis</span>
            <p className="text-xs text-[#bfc1c6] leading-relaxed line-clamp-6">{stripHtml(anime.description)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Compare() {
  usePageMeta("Compare Anime — raijin.", "Compare two anime side by side.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [idA, setIdA] = useState<number | null>(() => {
    const v = Number(searchParams.get("a"));
    return v || null;
  });
  const [idB, setIdB] = useState<number | null>(() => {
    const v = Number(searchParams.get("b"));
    return v || null;
  });

  // Sync IDs to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (idA) params.set("a", String(idA));
    if (idB) params.set("b", String(idB));
    navigate({ search: params.toString() }, { replace: true });
  }, [idA, idB, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-white mb-2">Compare Anime</h1>
      <p className="text-sm text-[#5d6169] mb-8">Search and pick two anime to compare them side by side.</p>

      {/* Pickers */}
      {(!idA || !idB) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {!idA && (
            <AnimePicker label="Anime A" selectedId={idA} onSelect={setIdA}  />
          )}
          {!idB && (
            <AnimePicker label="Anime B" selectedId={idB} onSelect={setIdB}  />
          )}
        </div>
      )}

      {/* Comparison grid */}
      {(idA || idB) && (
        <div className="grid grid-cols-2 gap-6 sm:gap-10">
          {idA ? (
            <AnimeColumn id={idA} onClear={() => setIdA(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-[#1e1e28] rounded-2xl">
              <p className="text-sm text-[#5d6169]">Pick anime A</p>
              <AnimePicker label="" selectedId={null} onSelect={setIdA} />
            </div>
          )}
          {idB ? (
            <AnimeColumn id={idB} onClear={() => setIdB(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-[#1e1e28] rounded-2xl">
              <p className="text-sm text-[#5d6169]">Pick anime B</p>
              <AnimePicker label="" selectedId={null} onSelect={setIdB} />
            </div>
          )}
        </div>
      )}

      {!idA && !idB && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <svg className="w-16 h-16 text-[#1e1e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p className="text-[#3a3a48] text-sm">Search for two anime above to compare them</p>
        </div>
      )}
    </div>
  );
}
