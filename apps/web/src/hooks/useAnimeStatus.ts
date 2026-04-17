import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export type AnimeStatusValue = "WATCHING" | "COMPLETED" | "DROPPED" | "PLAN_TO_WATCH";

export interface AnimeStatusEntry {
  id: number;
  userId: number;
  animeId: number;
  animeTitle: string;
  animeCover: string | null;
  status: AnimeStatusValue;
  updatedAt: string;
}

export const STATUS_LABELS: Record<AnimeStatusValue, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  PLAN_TO_WATCH: "Plan to Watch",
};

export const STATUS_COLORS: Record<AnimeStatusValue, string> = {
  WATCHING: "bg-blue-400",
  COMPLETED: "bg-green-400",
  DROPPED: "bg-red-400",
  PLAN_TO_WATCH: "bg-amber-400",
};

export function useAnimeStatus(animeId: number) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<AnimeStatusEntry | null>({
    queryKey: ["status", user?.id, animeId],
    queryFn: () => api.get<AnimeStatusEntry | null>(`/api/status/${animeId}`),
    enabled: isLoggedIn && animeId > 0,
    staleTime: 60_000,
  });
}

interface SetInput {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  status: AnimeStatusValue;
}

export function useSetAnimeStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ animeId, ...body }: SetInput) =>
      api.post<{ ok: boolean }>(`/api/status/${animeId}`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["status", user?.id, variables.animeId] });
      queryClient.invalidateQueries({ queryKey: ["status", user?.id] });
    },
  });
}

export function useRemoveAnimeStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (animeId: number) =>
      api.del<{ ok: boolean }>(`/api/status/${animeId}`),
    onSuccess: (_data, animeId) => {
      queryClient.invalidateQueries({ queryKey: ["status", user?.id, animeId] });
      queryClient.invalidateQueries({ queryKey: ["status", user?.id] });
    },
  });
}

export function useAllAnimeStatuses() {
  const { user, isLoggedIn } = useAuth();
  return useQuery<AnimeStatusEntry[]>({
    queryKey: ["status", user?.id],
    queryFn: () => api.get<AnimeStatusEntry[]>("/api/status"),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
}

interface BatchStatusInput {
  updates: { animeId: number; animeTitle: string; animeCover?: string | null; status: AnimeStatusValue }[];
}

export function useBatchSetAnimeStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BatchStatusInput) =>
      api.post<{ ok: boolean; count: number }>("/api/status/batch", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status", user?.id] });
    },
  });
}
