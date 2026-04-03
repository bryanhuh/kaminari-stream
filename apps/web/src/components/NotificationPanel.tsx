import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContinueWatching } from "../hooks/useWatchHistory";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATIC_NOTIFICATIONS = [
  {
    id: "top-picks",
    image: null,
    title: "Your Top Picks",
    body: "Find a new favorite anime to watch.",
    time: "1 day ago",
    accent: "#00AEEF",
  },
  {
    id: "new-season",
    image: null,
    title: "New Season Airing",
    body: "Explore what's currently airing this season.",
    time: "2 days ago",
    accent: "#7c3aed",
  },
  {
    id: "schedule",
    image: null,
    title: "Weekly Schedule Updated",
    body: "Check the latest airing schedule for this week.",
    time: "3 days ago",
    accent: "#059669",
  },
];

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: history } = useContinueWatching();

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const historyItems = (history ?? []).slice(0, 4);

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-full mt-3 z-50 transition-all duration-200 ${
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      {/* Arrow */}
      <div className="absolute -top-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#2a2a38]" />

      <div className="w-[360px] bg-[#111118] border border-[#2a2a38] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1e1e28] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          <span className="text-xs text-[#5d6169]">All caught up</span>
        </div>

        <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
          {/* Watch history notifications */}
          {historyItems.map((entry) => {
            const to = `/watch?animeId=${entry.animeId}&episodeId=${encodeURIComponent(entry.episodeId)}&ep=${entry.episodeNumber}`;
            const pct = entry.durationSeconds > 0
              ? Math.round((entry.progressSeconds / entry.durationSeconds) * 100)
              : 0;

            return (
              <button
                key={entry.id}
                onClick={() => { navigate(to); onClose(); }}
                className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-[#1e1e28] text-left"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-[72px] h-[48px] rounded-lg overflow-hidden bg-[#0a0a0f] relative">
                  {entry.animeCover ? (
                    <img
                      src={entry.animeCover}
                      alt={entry.animeTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#2a2a38]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight line-clamp-1">
                    Continue watching
                  </p>
                  <p className="text-xs text-[#bfc1c6] mt-0.5 line-clamp-1">
                    {entry.animeTitle} — Ep {entry.episodeNumber}
                  </p>
                  <p className="text-xs text-[#5d6169] mt-1">{timeAgo(entry.watchedAt)}</p>
                </div>
              </button>
            );
          })}

          {/* Static editorial notifications */}
          {STATIC_NOTIFICATIONS.map((notif, i) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors ${
                i < STATIC_NOTIFICATIONS.length - 1 ? "border-b border-[#1e1e28]" : ""
              }`}
            >
              {/* Icon tile */}
              <div
                className="shrink-0 w-[72px] h-[48px] rounded-lg flex items-center justify-center"
                style={{ backgroundColor: notif.accent + "22", border: `1px solid ${notif.accent}33` }}
              >
                {notif.id === "top-picks" && (
                  <svg className="w-5 h-5" fill="none" stroke={notif.accent} strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                )}
                {notif.id === "new-season" && (
                  <svg className="w-5 h-5" fill="none" stroke={notif.accent} strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875C19.5 4.254 18.996 3.75 18.375 3.75H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                )}
                {notif.id === "schedule" && (
                  <svg className="w-5 h-5" fill="none" stroke={notif.accent} strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">{notif.title}</p>
                <p className="text-xs text-[#bfc1c6] mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-xs text-[#5d6169] mt-1">{notif.time}</p>
              </div>
            </div>
          ))}

          {historyItems.length === 0 && STATIC_NOTIFICATIONS.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[#5d6169]">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
