import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export interface UserStats {
  totalEpisodes: number;
  totalHoursWatched: number;
  distinctAnime: number;
  statusBreakdown: {
    WATCHING: number;
    COMPLETED: number;
    DROPPED: number;
    PLAN_TO_WATCH: number;
  };
  avgRating: number | null;
  totalReviews: number;
  joinedAt: string | null;
}

export function useUserStats() {
  const { isLoggedIn, user } = useAuth();
  return useQuery<UserStats>({
    queryKey: ["user", "stats", user?.id],
    queryFn: () => api.get<UserStats>("/api/auth/stats"),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopGenres() {
  const { isLoggedIn, user } = useAuth();
  return useQuery<string[]>({
    queryKey: ["user", "top-genres", user?.id],
    queryFn: () => api.get<string[]>("/api/auth/top-genres"),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 15,
  });
}

export interface WeekBucket {
  week: string;
  episodes: number;
}

export function useHistoryChart() {
  const { isLoggedIn, user } = useAuth();
  return useQuery<WeekBucket[]>({
    queryKey: ["user", "history-chart", user?.id],
    queryFn: () => api.get<WeekBucket[]>("/api/auth/history-chart"),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 10,
  });
}
