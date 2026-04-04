import { useState, useEffect } from "react";

interface Comment {
  id: string;
  username: string;
  body: string;
  createdAt: string;
}

interface CommentsProps {
  animeId: number;
  episodeId: string;
}

function storageKey(animeId: number, episodeId: string) {
  return `comments:${animeId}:${episodeId}`;
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

function loadComments(animeId: number, episodeId: string): Comment[] {
  try {
    const raw = localStorage.getItem(storageKey(animeId, episodeId));
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function saveComments(animeId: number, episodeId: string, comments: Comment[]) {
  localStorage.setItem(storageKey(animeId, episodeId), JSON.stringify(comments));
}

export default function Comments({ animeId, episodeId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(() =>
    loadComments(animeId, episodeId)
  );
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem("commentUsername") ?? ""
  );
  const [body, setBody] = useState("");

  // Reload comments when episode changes
  useEffect(() => {
    setComments(loadComments(animeId, episodeId));
  }, [animeId, episodeId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedBody = body.trim();
    if (!trimmedUser || !trimmedBody) return;

    localStorage.setItem("commentUsername", trimmedUser);

    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username: trimmedUser,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    saveComments(animeId, episodeId, updated);
    setBody("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h2 className="text-base font-bold text-white">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-[#111118] border border-[#1e1e28] rounded-xl p-4"
      >
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={50}
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5d6169] focus:outline-none focus:border-primary-500/60 transition-colors"
        />
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
            disabled={!username.trim() || !body.trim()}
            className="bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0f] font-bold text-sm px-4 py-2 rounded-full shadow-lg shadow-primary-500/20 transition-colors"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
