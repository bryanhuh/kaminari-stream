import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
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
  return useQuery<WatchlistEntry[]>({
    queryKey: ["watchlist"],
    queryFn: () => api.get<WatchlistEntry[]>("/api/watchlist"),
    staleTime: 30_000,
  });
}

export function useWatchlistEntry(animeId: number) {
  return useQuery<WatchlistEntry | null>({
    queryKey: ["watchlist", animeId],
    queryFn: () => api.get<WatchlistEntry | null>(`/api/watchlist/${animeId}`),
    staleTime: 60_000,
    enabled: animeId > 0,
  });
}

/**
 * Checks watchlist membership by looking up the already-cached full watchlist
 * instead of making a per-anime network request. Use this in card contexts where
 * many components render simultaneously.
 */
export function useIsInWatchlist(animeId: number) {
  return useQuery<WatchlistEntry[], Error, boolean>({
    queryKey: ["watchlist"],
    queryFn: () => api.get<WatchlistEntry[]>("/api/watchlist"),
    staleTime: 30_000,
    select: (entries) => entries.some((e) => e.animeId === animeId),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddInput) =>
      api.post<{ ok: boolean }>("/api/watchlist", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist", variables.animeId] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (animeId: number) =>
      api.del<{ ok: boolean }>(`/api/watchlist/${animeId}`),
    onSuccess: (_data, animeId) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist", animeId] });
    },
  });
}
