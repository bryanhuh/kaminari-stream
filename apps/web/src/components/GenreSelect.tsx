import { useState, useRef, useEffect } from "react";

export const ANIME_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Mecha", "Psychological",
  "Shounen", "Shoujo", "Seinen", "Isekai", "Historical",
];

interface GenreSelectProps {
  value: string;
  onChange: (genre: string) => void;
}

export default function GenreSelect({ value, onChange }: GenreSelectProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
          value
            ? "border-primary-500 text-primary-400 bg-primary-500/10"
            : "border-[#2a2a38] text-[#bfc1c6] hover:border-[#3a3a4a] hover:text-white"
        }`}
      >
        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A.75.75 0 0 1 4.5 5.25h15a.75.75 0 0 1 0 1.5h-15A.75.75 0 0 1 3.75 6Zm3 6A.75.75 0 0 1 7.5 11.25h9a.75.75 0 0 1 0 1.5h-9A.75.75 0 0 1 6.75 12Zm3 6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" />
        </svg>
        {value || "Genres"}
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
        <div className="bg-[#111118] border border-[#2a2a38] rounded-xl shadow-2xl py-1.5 min-w-[180px] max-h-72 overflow-y-auto">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              !value ? "text-white font-semibold" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            All Genres
          </button>
          <div className="h-px bg-[#1e1e28] my-1" />
          {ANIME_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => { onChange(g); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === g
                  ? "text-primary-400 font-semibold bg-primary-500/10"
                  : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
