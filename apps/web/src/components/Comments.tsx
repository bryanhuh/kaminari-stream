import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useComments, useAddComment, useDeleteComment } from "../hooks/useComments";

interface CommentsProps {
  animeId: number;
  episodeId: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} days ago`;
}

export default function Comments({ animeId, episodeId }: CommentsProps) {
  const { user, isLoggedIn } = useAuth();
  const { data: comments = [], isLoading } = useComments(animeId, episodeId);
  const addComment = useAddComment(animeId, episodeId);
  const deleteComment = useDeleteComment(animeId, episodeId);
  const [body, setBody] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || addComment.isPending) return;
    addComment.mutate(trimmed, { onSuccess: () => setBody("") });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h2 className="text-base font-bold text-white">
        Comments ({isLoading ? "…" : comments.length})
      </h2>

      {/* Comment form — only shown when logged in */}
      {isLoggedIn ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 bg-[#111118] border border-[#1e1e28] rounded-xl p-4"
        >
          <p className="text-xs text-[#5d6169]">
            Posting as{" "}
            <span className="text-primary-400 font-semibold">{user?.username}</span>
          </p>
          <textarea
            placeholder="Share your thoughts about this episode..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5d6169] focus:outline-none focus:border-primary-500/60 transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!body.trim() || addComment.isPending}
              className="bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0f] font-bold text-sm px-4 py-2 rounded-full shadow-lg shadow-primary-500/20 transition-colors"
            >
              {addComment.isPending ? "Posting…" : "Post Comment"}
            </button>
          </div>
          {addComment.isError && (
            <p className="text-xs text-red-400">Failed to post comment. Try again.</p>
          )}
        </form>
      ) : (
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 text-center text-sm text-[#5d6169]">
          Sign in to join the discussion.
        </div>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <svg
            className="w-10 h-10 text-[#2a2a38]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-[#5d6169] text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 bg-[#111118] border border-[#1e1e28] rounded-xl p-4"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-400 uppercase">
                  {comment.username.charAt(0)}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {comment.username}
                  </span>
                  <span className="text-xs text-[#5d6169]">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#bfc1c6] leading-relaxed whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>

              {/* Delete — only own comments */}
              {user?.username === comment.username && (
                <button
                  onClick={() => deleteComment.mutate(comment.id)}
                  disabled={deleteComment.isPending}
                  aria-label="Delete comment"
                  className="shrink-0 text-[#3a3a48] hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
