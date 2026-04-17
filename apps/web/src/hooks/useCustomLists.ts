import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export interface CustomList {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
}

export interface CustomListEntry {
  listId: number;
  animeId: number;
  animeTitle: string;
  animeCover: string | null;
  addedAt: string;
}

export function useCustomLists() {
  const { user, isLoggedIn } = useAuth();
  return useQuery<CustomList[]>({
    queryKey: ["custom-lists", user?.id],
    queryFn: () => api.get<CustomList[]>("/api/lists"),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });
}

export function useCustomListEntries(listId: number | null) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<CustomListEntry[]>({
    queryKey: ["custom-list-entries", user?.id, listId],
    queryFn: () => api.get<CustomListEntry[]>(`/api/lists/${listId}/entries`),
    enabled: isLoggedIn && listId !== null,
    staleTime: 30_000,
  });
}

export function useCreateCustomList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<CustomList>("/api/lists", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-lists", user?.id] }),
  });
}

export function useDeleteCustomList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: number) => api.del<{ ok: boolean }>(`/api/lists/${listId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-lists", user?.id] }),
  });
}

export function useRenameCustomList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, name }: { listId: number; name: string }) =>
      api.patch<{ ok: boolean }>(`/api/lists/${listId}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-lists", user?.id] }),
  });
}

export function useAddToCustomList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      animeId,
      animeTitle,
      animeCover,
    }: {
      listId: number;
      animeId: number;
      animeTitle: string;
      animeCover?: string | null;
    }) => api.post<{ ok: boolean }>(`/api/lists/${listId}/entries`, { animeId, animeTitle, animeCover }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["custom-list-entries", user?.id, vars.listId] });
    },
  });
}

export function useRemoveFromCustomList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, animeId }: { listId: number; animeId: number }) =>
      api.del<{ ok: boolean }>(`/api/lists/${listId}/entries/${animeId}`),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["custom-list-entries", user?.id, vars.listId] });
    },
  });
}
