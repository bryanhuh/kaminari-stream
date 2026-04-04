import { useWatchlistEntry, useAddToWatchlist, useRemoveFromWatchlist } from "../hooks/useWatchlist";

interface WatchlistButtonProps {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  format?: string | null;
  episodes?: number | null;
  score?: number | null;
  status?: string | null;
  /** "full" shows text label; "icon" shows icon-only (default "full") */
  variant?: "full" | "icon";
}

export default function WatchlistButton({
  animeId,
  animeTitle,
  animeCover,
  format,
  episodes,
  score,
  status,
  variant = "full",
}: WatchlistButtonProps) {
  const { data: entry, isLoading: entryLoading } = useWatchlistEntry(animeId);
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const inWatchlist = !!entry;
  const isPending = addMutation.isPending || removeMutation.isPending;
  const isDisabled = entryLoading || isPending;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;

    if (inWatchlist) {
      removeMutation.mutate(animeId);
    } else {
      addMutation.mutate({ animeId, animeTitle, animeCover, format, episodes, score, status });
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 disabled:opacity-50 ${
          inWatchlist
            ? "bg-primary-500 text-[#0a0a0f] hover:bg-primary-400"
            : "bg-black/60 text-white hover:bg-black/80 border border-white/20"
        }`}
      >
        {isPending ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        ) : inWatchlist ? (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-colors shadow-lg disabled:opacity-50 ${
        inWatchlist
          ? "bg-white/10 hover:bg-white/15 text-white border border-[#2a2a38]"
          : "bg-white/5 hover:bg-white/10 text-white border border-[#2a2a38]"
      }`}
    >
      {isPending ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      ) : inWatchlist ? (
        <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
        </svg>
      )}
      {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
