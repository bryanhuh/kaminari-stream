import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export interface Review {
  id: number;
  username: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

export interface ReviewStats {
  average: number | null;
  total: number;
}

export interface ReviewsData {
  reviews: Review[];
  stats: ReviewStats;
}

export interface MyReview {
  id: number;
  animeId: number;
  rating: number;
  review: string | null;
  createdAt: string;
}

function listKey(animeId: number) {
  return ["reviews", animeId];
}

function mineKey(animeId: number, userId: number | undefined) {
  return ["reviews", animeId, "mine", userId];
}

export function useReviews(animeId: number) {
  return useQuery<ReviewsData>({
    queryKey: listKey(animeId),
    queryFn: () => api.get<ReviewsData>(`/api/reviews?animeId=${animeId}`),
    enabled: animeId > 0,
    staleTime: 30_000,
  });
}

export function useMyReview(animeId: number) {
  const { user, isLoggedIn } = useAuth();
  return useQuery<MyReview | null>({
    queryKey: mineKey(animeId, user?.id),
    queryFn: () => api.get<MyReview | null>(`/api/reviews/mine?animeId=${animeId}`),
    enabled: isLoggedIn && animeId > 0,
    staleTime: 60_000,
  });
}

export function useUpsertReview(animeId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; review?: string | null }) =>
      api.post<MyReview>("/api/reviews", { animeId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(animeId) });
      queryClient.invalidateQueries({ queryKey: mineKey(animeId, user?.id) });
    },
  });
}

export function useDeleteReview(animeId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.del<{ ok: boolean }>(`/api/reviews/${animeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(animeId) });
      queryClient.invalidateQueries({ queryKey: mineKey(animeId, user?.id) });
    },
  });
}
