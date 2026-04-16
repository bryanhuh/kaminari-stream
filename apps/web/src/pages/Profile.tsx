import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserStats } from "../hooks/useUser";
import { usePageMeta } from "../hooks/usePageMeta";
import LoginPrompt from "../components/LoginPrompt";

const profileIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-[#111118] border border-[#1e1e28]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#5d6169]">{label}</p>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      {sub && <p className="text-xs text-[#5d6169]">{sub}</p>}
    </div>
  );
}

const STATUS_CONFIG = [
  { key: "WATCHING", label: "Watching", color: "bg-blue-500" },
  { key: "COMPLETED", label: "Completed", color: "bg-primary-500" },
  { key: "PLAN_TO_WATCH", label: "Plan to Watch", color: "bg-purple-500" },
  { key: "DROPPED", label: "Dropped", color: "bg-red-500" },
] as const;

function joinedLabel(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  usePageMeta(
    user ? `${user.username} — raijin.` : "Profile — raijin.",
    "Your anime watching stats on raijin."
  );

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>
        <LoginPrompt
          icon={profileIcon}
          heading="Sign in to view your profile"
          body="Your watch stats, ratings, and activity will be displayed here once you're signed in."
        />
      </div>
    );
  }

  return <ProfileContent />;
}

function ProfileContent() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useUserStats();

  const totalAnimeTracked = stats
    ? Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/30 text-primary-400 font-extrabold text-2xl shrink-0">
          {user!.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{user!.username}</h1>
          <p className="text-sm text-[#5d6169]">{user!.email}</p>
          {stats?.joinedAt && (
            <p className="text-xs text-[#3d3d4f] mt-0.5">Member since {joinedLabel(stats.joinedAt)}</p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#111118] animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Episodes Watched"
            value={stats.totalEpisodes.toLocaleString()}
          />
          <StatCard
            label="Hours Watched"
            value={stats.totalHoursWatched.toFixed(1)}
            sub="hours"
          />
          <StatCard
            label="Anime Watched"
            value={stats.distinctAnime.toLocaleString()}
          />
          <StatCard
            label="Avg Rating"
            value={stats.avgRating !== null ? `${stats.avgRating.toFixed(1)}/10` : "—"}
            sub={stats.totalReviews > 0 ? `${stats.totalReviews} review${stats.totalReviews === 1 ? "" : "s"}` : undefined}
          />
        </div>
      ) : null}

      {/* Status breakdown */}
      {(isLoading || (stats && totalAnimeTracked > 0)) && (
        <div className="flex flex-col gap-4 p-5 rounded-xl bg-[#111118] border border-[#1e1e28]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Anime List</h2>
            {!isLoading && (
              <span className="text-xs text-[#5d6169]">{totalAnimeTracked} total</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-[#1e1e28] animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <div className="flex flex-col gap-3">
              {STATUS_CONFIG.map(({ key, label, color }) => {
                const count = stats.statusBreakdown[key];
                const pct = totalAnimeTracked > 0 ? (count / totalAnimeTracked) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-[#bfc1c6] w-28 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#1e1e28] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#5d6169] w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Watch History", to: "/history", desc: "All your watched episodes" },
          { label: "Watchlist", to: "/watchlist", desc: "Anime you've saved" },
        ].map(({ label, to, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col gap-1 p-4 rounded-xl bg-[#111118] border border-[#1e1e28] hover:border-[#2a2a38] hover:bg-[#13131b] transition-colors group"
          >
            <span className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
              {label}
            </span>
            <span className="text-xs text-[#5d6169]">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
