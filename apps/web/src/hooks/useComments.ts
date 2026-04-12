import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Comment {
  id: number;
  username: string;
  body: string;
  createdAt: string;
}

function queryKey(animeId: number, episodeId: string) {
  return ["comments", animeId, episodeId];
}

export function useComments(animeId: number, episodeId: string) {
  return useQuery<Comment[]>({
    queryKey: queryKey(animeId, episodeId),
    queryFn: () =>
      api.get<Comment[]>(
        `/api/comments?animeId=${animeId}&episodeId=${encodeURIComponent(episodeId)}`
      ),
    enabled: animeId > 0 && episodeId.length > 0,
    staleTime: 30_000,
  });
}

export function useAddComment(animeId: number, episodeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api.post<Comment>("/api/comments", { animeId, episodeId, body }),
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(queryKey(animeId, episodeId), (old = []) => [
        newComment,
        ...old,
      ]);
    },
  });
}

export function useDeleteComment(animeId: number, episodeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<{ ok: boolean }>(`/api/comments/${id}`),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Comment[]>(queryKey(animeId, episodeId), (old = []) =>
        old.filter((c) => c.id !== id)
      );
    },
  });
}
