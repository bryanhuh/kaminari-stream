import { useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist, useRemoveFromWatchlist } from "../hooks/useWatchlist";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";
import LazyImage from "../components/LazyImage";
import {
  useAllAnimeStatuses,
  useBatchSetAnimeStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type AnimeStatusValue,
} from "../hooks/useAnimeStatus";
import type { WatchlistEntry } from "@anime-app/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function downloadExport(format: "csv" | "json") {
  const raw = localStorage.getItem("raijin_auth");
  const token = raw ? (JSON.parse(raw) as { token?: string }).token : null;
  const res = await fetch(`${BASE}/api/watchlist/export?format=${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `watchlist.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

const watchlistIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
  </svg>
);

const STATUS_VALUES = ["WATCHING", "COMPLETED", "DROPPED", "PLAN_TO_WATCH"] as const;

export default function Watchlist() {
  usePageMeta("My Watchlist — raijin.", "Your saved anime watchlist on raijin.");
  const { isLoggedIn } = useAuth();
  const { data, isLoading } = useWatchlist();
  const { data: allStatuses } = useAllAnimeStatuses();
  const batchStatus = useBatchSetAnimeStatus();

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchStatusValue, setBatchStatusValue] = useState<AnimeStatusValue>("WATCHING");

  const statusMap = new Map((allStatuses ?? []).map((s) => [s.animeId, s.status]));

  function toggleSelect(animeId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(animeId)) next.delete(animeId);
      else next.add(animeId);
      return next;
    });
  }

  function enterSelectMode() {
    setSelectMode(true);
    setSelected(new Set());
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function selectAll() {
    setSelected(new Set((data ?? []).map((e) => e.animeId)));
  }

  async function applyBatchStatus() {
    const entries = data ?? [];
    const updates = entries
      .filter((e) => selected.has(e.animeId))
      .map((e) => ({
        animeId: e.animeId,
        animeTitle: e.animeTitle,
        animeCover: e.animeCover,
        status: batchStatusValue,
      }));
    if (!updates.length) return;
    await batchStatus.mutateAsync({ updates });
    exitSelectMode();
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">My Watchlist</h1>
        <LoginPrompt
          icon={watchlistIcon}
          heading="Sign in to access your watchlist"
          body="Save anime you want to watch and pick up right where you left off."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">My Watchlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5 animate-pulse">
              <div className="aspect-[3/4] rounded-xl bg-[#111118]" />
              <div className="h-4 rounded bg-[#111118] w-4/5" />
              <div className="h-3 rounded bg-[#111118] w-2/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const entries = data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {entries.length > 0 && (
            <span className="text-sm text-[#5d6169]">{entries.length} {entries.length === 1 ? "title" : "titles"}</span>
          )}
          {entries.length > 0 && !selectMode && (
            <>
              <button
                onClick={enterSelectMode}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-[#2a2a38] text-[#bfc1c6] hover:border-primary-500 hover:text-primary-400 transition-colors"
              >
                Select
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => downloadExport("json")}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#2a2a38] text-[#bfc1c6] hover:border-primary-500 hover:text-primary-400 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => downloadExport("csv")}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#2a2a38] text-[#bfc1c6] hover:border-primary-500 hover:text-primary-400 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch action bar */}
      {selectMode && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-[#1e1e28] border border-[#2a2a38]">
          <span className="text-sm text-[#bfc1c6] font-medium">
            {selected.size} selected
          </span>
          <button
            onClick={selectAll}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Select all
          </button>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-xs text-[#5d6169]">Set status:</span>
            <select
              value={batchStatusValue}
              onChange={(e) => setBatchStatusValue(e.target.value as AnimeStatusValue)}
              className="text-xs bg-[#111118] border border-[#2a2a38] rounded-lg px-2.5 py-1.5 text-[#bfc1c6] focus:outline-none focus:border-primary-500"
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={applyBatchStatus}
              disabled={selected.size === 0 || batchStatus.isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-500 text-[#0a0a0f] font-semibold hover:bg-primary-400 transition-colors disabled:opacity-40"
            >
              {batchStatus.isPending ? "Applying…" : "Apply"}
            </button>
            <button
              onClick={exitSelectMode}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a38] text-[#5d6169] hover:text-[#bfc1c6] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <svg className="w-16 h-16 text-[#2a2a38]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
          </svg>
          <p className="text-[#5d6169] text-lg font-medium">Your watchlist is empty</p>
          <p className="text-[#3d3d4f] text-sm">Browse anime and add titles you want to watch</p>
          <Link
            to="/browse"
            className="mt-2 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {entries.map((entry) => (
            <WatchlistCard
              key={entry.id}
              entry={entry}
              statusValue={statusMap.get(entry.animeId) ?? null}
              selectMode={selectMode}
              selected={selected.has(entry.animeId)}
              onToggleSelect={() => toggleSelect(entry.animeId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WatchlistCardProps {
  entry: WatchlistEntry;
  statusValue: AnimeStatusValue | null;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}

function WatchlistCard({ entry, statusValue, selectMode, selected, onToggleSelect }: WatchlistCardProps) {
  const remove = useRemoveFromWatchlist();

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    remove.mutate(entry.animeId);
  }

  function handleCardClick(e: React.MouseEvent) {
    if (selectMode) {
      e.preventDefault();
      onToggleSelect();
    }
  }

  return (
    <Link
      to={`/anime/${entry.animeId}`}
      className={`group flex flex-col gap-2.5 ${selectMode ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <div
        className={`relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118] transition-all duration-150 ${
          selectMode && selected ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-[#0a0a0f]" : ""
        }`}
      >
        {entry.animeCover ? (
          <LazyImage
            src={entry.animeCover}
            alt={entry.animeTitle}
            className="w-full h-full object-cover group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-sm">
            No image
          </div>
        )}

        {/* Select checkbox */}
        {selectMode && (
          <div className="absolute top-2 left-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
              selected ? "bg-primary-500 border-primary-500" : "bg-black/60 border-white/40"
            }`}>
              {selected && (
                <svg className="w-3 h-3 text-[#0a0a0f]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Remove button (hidden in select mode) */}
        {!selectMode && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleRemove}
              disabled={remove.isPending}
              aria-label="Remove from watchlist"
              title="Remove from watchlist"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] transition-colors disabled:opacity-50"
            >
              {remove.isPending ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Score badge */}
        {entry.score && !selectMode && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary-500 text-[#0a0a0f] text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {(entry.score / 10).toFixed(1)}
          </div>
        )}

        {/* Format badge */}
        {entry.format && (
          <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-[#bfc1c6] px-1.5 py-0.5 rounded uppercase tracking-wide backdrop-blur-sm">
            {entry.format}
          </div>
        )}

        {/* Status badge */}
        {statusValue && !selectMode && (
          <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full ${STATUS_COLORS[statusValue]} shadow-md`} title={STATUS_LABELS[statusValue]} />
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {entry.animeTitle}
        </p>
        <div className="flex items-center gap-1.5">
          {entry.episodes && (
            <p className="text-xs text-[#5d6169]">{entry.episodes} eps</p>
          )}
          {statusValue && (
            <span className="text-xs text-[#5d6169]">· {STATUS_LABELS[statusValue]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
