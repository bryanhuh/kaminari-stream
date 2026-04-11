import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { WatchHistoryEntry, WatchProgress } from "@anime-app/types";

type ProgressInput = Omit<WatchHistoryEntry, "id"> & { animeCover?: string | null };

export function useContinueWatching() {
  const { user, isLoggedIn } = useAuth();
  return useQuery<WatchHistoryEntry[]>({
    queryKey: ["history", "continue", user?.id],
    queryFn: () => api.get<WatchHistoryEntry[]>("/api/history/continue"),
    enabled: isLoggedIn,
    staleTime: 0,
  });
}

export function useAnimeHistory(animeId: number) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<WatchHistoryEntry[]>({
    queryKey: ["history", "anime", user?.id, animeId],
    queryFn: () => api.get<WatchHistoryEntry[]>(`/api/history/${animeId}`),
    enabled: isLoggedIn && animeId > 0,
    staleTime: 0,
  });
}

export function useSaveProgress() {
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProgressInput) => {
      if (!isLoggedIn) return Promise.resolve({ ok: false });
      return api.post<{ ok: boolean }>("/api/history", input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["history", "continue", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["history", "anime", user?.id, variables.animeId],
      });
    },
  });
}

export function useRemoveFromHistory(animeId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<{ ok: boolean }>(`/api/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", "continue", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["history", "anime", user?.id, animeId] });
    },
  });
}

export function useEpisodeProgress(
  history: WatchHistoryEntry[] | undefined,
  episodeId: string
): WatchProgress | null {
  if (!history) return null;
  return history.find((e) => e.episodeId === episodeId) ?? null;
}
