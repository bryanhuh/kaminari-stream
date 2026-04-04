import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../lib/api";

const DISMISS_AFTER_MS = 8000;

export default function RateLimitToast() {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        event.query.state.status === "error" &&
        event.query.state.error instanceof ApiError &&
        event.query.state.error.status === 429
      ) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), DISMISS_AFTER_MS);
      }
    });
    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queryClient]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1e1e28] border border-yellow-500/30 text-yellow-200 text-sm px-5 py-3.5 rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-md"
    >
      <svg
        className="w-4 h-4 text-yellow-400 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <span className="flex-1 leading-snug">
        AniList rate limit reached — some content may be unavailable. Try again in a moment.
      </span>
      <button
        onClick={() => setVisible(false)}
        className="text-yellow-400/50 hover:text-yellow-300 transition-colors shrink-0 p-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
