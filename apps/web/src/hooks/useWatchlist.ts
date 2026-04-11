import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { WatchlistEntry } from "@anime-app/types";

interface AddInput {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  format?: string | null;
  episodes?: number | null;
  score?: number | null;
  status?: string | null;
}

export function useWatchlist() {
  const { user, isLoggedIn } = useAuth();
  return useQuery<WatchlistEntry[]>({
    queryKey: ["watchlist", user?.id],
    queryFn: () => api.get<WatchlistEntry[]>("/api/watchlist"),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });
}

export function useWatchlistEntry(animeId: number) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<WatchlistEntry | null>({
    queryKey: ["watchlist", user?.id, animeId],
    queryFn: () => api.get<WatchlistEntry | null>(`/api/watchlist/${animeId}`),
    enabled: isLoggedIn && animeId > 0,
    staleTime: 60_000,
  });
}

/**
 * Checks watchlist membership by looking up the already-cached full watchlist
 * instead of making a per-anime network request.
 */
export function useIsInWatchlist(animeId: number) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<WatchlistEntry[], Error, boolean>({
    queryKey: ["watchlist", user?.id],
    queryFn: () => api.get<WatchlistEntry[]>("/api/watchlist"),
    enabled: isLoggedIn,
    staleTime: 30_000,
    select: (entries) => entries.some((e) => e.animeId === animeId),
  });
}

export function useAddToWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddInput) =>
      api.post<{ ok: boolean }>("/api/watchlist", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id, variables.animeId] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (animeId: number) =>
      api.del<{ ok: boolean }>(`/api/watchlist/${animeId}`),
    onSuccess: (_data, animeId) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id, animeId] });
    },
  });
}
