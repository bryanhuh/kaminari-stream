import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { WatchHistoryEntry, WatchProgress } from "@anime-app/types";

type ProgressInput = Omit<WatchHistoryEntry, "id"> & { animeCover?: string | null };

export function useContinueWatching() {
  return useQuery<WatchHistoryEntry[]>({
    queryKey: ["history", "continue"],
    queryFn: () => api.get<WatchHistoryEntry[]>("/api/history/continue"),
    staleTime: 0,
  });
}

export function useAnimeHistory(animeId: number) {
  return useQuery<WatchHistoryEntry[]>({
    queryKey: ["history", "anime", animeId],
    queryFn: () => api.get<WatchHistoryEntry[]>(`/api/history/${animeId}`),
    staleTime: 0,
    enabled: animeId > 0,
  });
}

export function useSaveProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProgressInput) =>
      api.post<{ ok: boolean }>("/api/history", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["history", "continue"] });
      queryClient.invalidateQueries({
        queryKey: ["history", "anime", variables.animeId],
      });
    },
  });
}

export function useRemoveFromHistory(animeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<{ ok: boolean }>(`/api/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", "continue"] });
      queryClient.invalidateQueries({ queryKey: ["history", "anime", animeId] });
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
