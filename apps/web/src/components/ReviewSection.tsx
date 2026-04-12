import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useReviews,
  useMyReview,
  useUpsertReview,
  useDeleteReview,
} from "../hooks/useReviews";

interface Props {
  animeId: number;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}

function StarRow({
  value,
  max = 10,
  interactive = false,
  hover = 0,
  onHover,
  onClick,
  size = "md",
}: {
  value: number;
  max?: number;
  interactive?: boolean;
  hover?: number;
  onHover?: (n: number) => void;
  onClick?: (n: number) => void;
  size?: "sm" | "md";
}) {
  const active = interactive && hover > 0 ? hover : value;
  const px = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => onHover?.(n)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onClick?.(n)}
          className={`${px} transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
          aria-label={interactive ? `Rate ${n} out of ${max}` : undefined}
        >
          <svg
            viewBox="0 0 24 24"
            fill={n <= active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={
              n <= active
                ? "text-primary-400"
                : "text-[#2a2a38]"
            }
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ animeId }: Props) {
  const { user, isLoggedIn } = useAuth();
  const { data, isLoading: listLoading } = useReviews(animeId);
  const { data: myReview, isLoading: myLoading } = useMyReview(animeId);
  const upsert = useUpsertReview(animeId);
  const del = useDeleteReview(animeId);

  const [hover, setHover] = useState(0);
  const [draft, setDraft] = useState<{ rating: number; review: string }>({
    rating: 0,
    review: "",
  });
  const [editing, setEditing] = useState(false);

  // Pre-fill form when existing review loads
  useEffect(() => {
    if (myReview && !editing) {
      setDraft({ rating: myReview.rating, review: myReview.review ?? "" });
    }
  }, [myReview, editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.rating === 0 || upsert.isPending) return;
    upsert.mutate(
      { rating: draft.rating, review: draft.review.trim() || null },
      { onSuccess: () => setEditing(false) }
    );
  }

  const stats = data?.stats;
  const reviews = data?.reviews ?? [];
  const hasMyReview = !!myReview && !editing;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats header */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white">Ratings & Reviews</h2>
        {stats && stats.total > 0 && (
          <div className="flex items-center gap-2">
            <StarRow value={Math.round(stats.average ?? 0)} size="sm" />
            <span className="text-primary-300 font-bold text-sm">
              {stats.average?.toFixed(1)}
            </span>
            <span className="text-[#5d6169] text-xs">
              ({stats.total} {stats.total === 1 ? "rating" : "ratings"})
            </span>
          </div>
        )}
      </div>

      {/* Form area */}
      {isLoggedIn ? (
        <>
          {/* Show existing review with edit/delete */}
          {hasMyReview && myReview ? (
            <div className="bg-[#111118] border border-primary-500/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StarRow value={myReview.rating} size="sm" />
                  <span className="text-primary-400 font-bold text-sm">
                    {myReview.rating}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-[#5d6169] hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => del.mutate()}
                    disabled={del.isPending}
                    className="text-xs text-[#5d6169] hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {myReview.review && (
                <p className="text-sm text-[#bfc1c6] leading-relaxed">
                  {myReview.review}
                </p>
              )}
              <p className="text-xs text-[#5d6169]">Your review</p>
            </div>
          ) : (
            /* Rating form */
            !myLoading && (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 bg-[#111118] border border-[#1e1e28] rounded-xl p-4"
              >
                <p className="text-xs text-[#5d6169]">
                  Rating as{" "}
                  <span className="text-primary-400 font-semibold">{user?.username}</span>
                </p>
                <div className="flex items-center gap-3">
                  <StarRow
                    value={draft.rating}
                    interactive
                    hover={hover}
                    onHover={setHover}
                    onClick={(n) => setDraft((d) => ({ ...d, rating: n }))}
                  />
                  {draft.rating > 0 && (
                    <span className="text-primary-400 font-bold text-sm">
                      {draft.rating}/10
                    </span>
                  )}
                </div>
                <textarea
                  placeholder="Write a short review (optional)…"
                  value={draft.review}
                  onChange={(e) => setDraft((d) => ({ ...d, review: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5d6169] focus:outline-none focus:border-primary-500/60 transition-colors resize-none"
                />
                <div className="flex items-center justify-between">
                  {editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setDraft({ rating: myReview?.rating ?? 0, review: myReview?.review ?? "" });
                      }}
                      className="text-xs text-[#5d6169] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <div className="ml-auto">
                    <button
                      type="submit"
                      disabled={draft.rating === 0 || upsert.isPending}
                      className="bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0f] font-bold text-sm px-4 py-2 rounded-full shadow-lg shadow-primary-500/20 transition-colors"
                    >
                      {upsert.isPending
                        ? "Saving…"
                        : myReview
                        ? "Update Review"
                        : "Submit Review"}
                    </button>
                  </div>
                </div>
                {upsert.isError && (
                  <p className="text-xs text-red-400">Failed to save. Try again.</p>
                )}
              </form>
            )
          )}
        </>
      ) : (
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 text-center text-sm text-[#5d6169]">
          Sign in to rate this anime.
        </div>
      )}

      {/* Reviews list */}
      {listLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#5d6169] text-center py-6">
          No reviews yet. Be the first to rate this anime!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex gap-3 bg-[#111118] border border-[#1e1e28] rounded-xl p-4"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-400 uppercase">
                  {r.username.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{r.username}</span>
                  <StarRow value={r.rating} size="sm" />
                  <span className="text-primary-300 text-xs font-bold">{r.rating}/10</span>
                  <span className="text-xs text-[#5d6169]">{timeAgo(r.createdAt)}</span>
                </div>
                {r.review && (
                  <p className="text-sm text-[#bfc1c6] leading-relaxed whitespace-pre-wrap break-words">
                    {r.review}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
