import { Link } from "react-router-dom";
import { useContinueWatching, useRemoveFromHistory } from "../hooks/useWatchHistory";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";
import type { WatchHistoryEntry } from "@anime-app/types";

const historyIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

function formatProgress(entry: WatchHistoryEntry): string {
  if (!entry.durationSeconds) return `Ep ${entry.episodeNumber}`;
  const pct = Math.round((entry.progressSeconds / entry.durationSeconds) * 100);
  return `Ep ${entry.episodeNumber} · ${pct}%`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function History() {
  usePageMeta("Watch History — raijin.", "Your anime watch history and episode progress on raijin.");
  const { isLoggedIn } = useAuth();
  const { data, isLoading } = useContinueWatching();

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Watch History</h1>
        <LoginPrompt
          icon={historyIcon}
          heading="Sign in to see your watch history"
          body="Your episode progress and watch history will be saved and synced when you're signed in."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Watch History</h1>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#111118] animate-pulse">
              <div className="w-20 h-[60px] rounded-lg bg-[#1e1e28] shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 rounded bg-[#1e1e28] w-1/2" />
                <div className="h-3 rounded bg-[#1e1e28] w-1/4" />
                <div className="h-1.5 rounded-full bg-[#1e1e28] w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const entries = data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Watch History</h1>
        {entries.length > 0 && (
          <span className="text-sm text-[#5d6169]">{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <svg className="w-16 h-16 text-[#2a2a38]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-[#5d6169] text-lg font-medium">No watch history yet</p>
          <p className="text-[#3d3d4f] text-sm">Start watching anime to track your progress here</p>
          <Link
            to="/browse"
            className="mt-2 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry }: { entry: WatchHistoryEntry }) {
  const pct = entry.durationSeconds
    ? Math.min(100, Math.round((entry.progressSeconds / entry.durationSeconds) * 100))
    : 0;
  const remove = useRemoveFromHistory(entry.animeId);

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-xl bg-[#111118] border border-[#1e1e28] hover:border-[#2a2a38] hover:bg-[#13131b] transition-colors">
      <Link
        to={`/watch?animeId=${entry.animeId}&episodeId=${encodeURIComponent(entry.episodeId)}&ep=${entry.episodeNumber}`}
        className="contents"
      >
      {/* Cover */}
      <div className="relative shrink-0 w-20 h-[60px] rounded-lg overflow-hidden bg-[#1e1e28]">
        {entry.animeCover ? (
          <img
            src={entry.animeCover}
            alt={entry.animeTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {entry.animeTitle}
        </p>
        <p className="text-xs text-[#5d6169]">{formatProgress(entry)}</p>
        {entry.durationSeconds > 0 && (
          <div className="h-1 rounded-full bg-[#1e1e28] overflow-hidden mt-0.5">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Time */}
      <div className="shrink-0 text-xs text-[#3d3d4f] hidden sm:block">
        {timeAgo(entry.watchedAt)}
      </div>

      {/* Resume icon */}
      <div className="shrink-0 text-[#5d6169] group-hover:text-primary-400 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
      </div>
      </Link>

      {/* Delete button — outside the Link so it doesn't navigate */}
      <button
        onClick={() => remove.mutate(entry.id)}
        disabled={remove.isPending}
        aria-label="Remove from history"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-[#5d6169] hover:text-red-400 hover:bg-white/5 disabled:opacity-30"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
