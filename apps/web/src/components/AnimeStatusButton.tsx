import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useAnimeStatus,
  useSetAnimeStatus,
  useRemoveAnimeStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type AnimeStatusValue,
} from "../hooks/useAnimeStatus";

const ALL_STATUSES: AnimeStatusValue[] = ["WATCHING", "COMPLETED", "DROPPED", "PLAN_TO_WATCH"];

interface Props {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
}

export default function AnimeStatusButton({ animeId, animeTitle, animeCover }: Props) {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entry, isLoading } = useAnimeStatus(animeId);
  const setMutation = useSetAnimeStatus();
  const removeMutation = useRemoveAnimeStatus();

  const currentStatus = entry?.status ?? null;
  const isPending = setMutation.isPending || removeMutation.isPending;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  if (!isLoggedIn) return null;

  function handleSelect(status: AnimeStatusValue) {
    setMutation.mutate({ animeId, animeTitle, animeCover, status });
    setOpen(false);
  }

  function handleRemove() {
    removeMutation.mutate(animeId);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading || isPending}
        className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-colors border border-[#2a2a38] bg-white/5 hover:bg-white/10 text-white disabled:opacity-50"
        aria-label="Set watch status"
      >
        {isPending ? (
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        ) : currentStatus ? (
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[currentStatus]}`} />
        ) : (
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
        <span>{currentStatus ? STATUS_LABELS[currentStatus] : "Add to List"}</span>
        <svg className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-48 rounded-xl bg-[#18181f] border border-[#2a2a38] shadow-xl overflow-hidden py-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5 ${
                currentStatus === s ? "text-white font-semibold" : "text-[#bfc1c6]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[s]}`} />
              {STATUS_LABELS[s]}
              {currentStatus === s && (
                <svg className="w-3.5 h-3.5 ml-auto text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}

          {currentStatus && (
            <>
              <div className="mx-3 my-1 border-t border-[#2a2a38]" />
              <button
                onClick={handleRemove}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-white/5 transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove from list
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
