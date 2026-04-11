import { Link } from "react-router-dom";
import { useWatchlist, useRemoveFromWatchlist } from "../hooks/useWatchlist";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";
import type { WatchlistEntry } from "@anime-app/types";

const watchlistIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
  </svg>
);

export default function Watchlist() {
  usePageMeta("My Watchlist — raijin.", "Your saved anime watchlist on raijin.");
  const { isLoggedIn } = useAuth();
  const { data, isLoading } = useWatchlist();

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
        {entries.length > 0 && (
          <span className="text-sm text-[#5d6169]">{entries.length} {entries.length === 1 ? "title" : "titles"}</span>
        )}
      </div>

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
            <WatchlistCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistCard({ entry }: { entry: WatchlistEntry }) {
  const remove = useRemoveFromWatchlist();

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    remove.mutate(entry.animeId);
  }

  return (
    <Link to={`/anime/${entry.animeId}`} className="group flex flex-col gap-2.5">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
        {entry.animeCover ? (
          <img
            src={entry.animeCover}
            alt={entry.animeTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-sm">
            No image
          </div>
        )}

        {/* Remove button */}
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

        {/* Score badge */}
        {entry.score && (
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
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
          {entry.animeTitle}
        </p>
        {entry.episodes && (
          <p className="text-xs text-[#5d6169]">{entry.episodes} episodes</p>
        )}
      </div>
    </Link>
  );
}
