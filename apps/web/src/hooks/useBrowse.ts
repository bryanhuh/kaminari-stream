import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { BrowseResponse, ScheduleItem } from "@anime-app/types";

export function useBrowseGenre(genre: string | null, page = 1) {
  return useQuery<BrowseResponse>({
    queryKey: ["browse", "genre", genre, page],
    queryFn: () =>
      api.get<BrowseResponse>(`/api/browse/genre/${encodeURIComponent(genre!)}?page=${page}`),
    enabled: !!genre,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSchedule(date: string) {
  return useQuery<ScheduleItem[]>({
    queryKey: ["browse", "schedule", date],
    queryFn: () => api.get<ScheduleItem[]>(`/api/browse/schedule/${date}`),
    staleTime: 1000 * 60 * 10,
  });
}

export function useBrowseCategory(
  category: "new-releases" | "ongoing" | "updates" | null,
  page = 1
) {
  return useQuery<BrowseResponse>({
    queryKey: ["browse", category, page],
    queryFn: () => api.get<BrowseResponse>(`/api/browse/${category}?page=${page}`),
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInfiniteBrowseGenre(genre: string | null) {
  return useInfiniteQuery<BrowseResponse>({
    queryKey: ["browse", "genre", "infinite", genre],
    queryFn: ({ pageParam }) =>
      api.get<BrowseResponse>(
        `/api/browse/genre/${encodeURIComponent(genre!)}?page=${pageParam}`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled: !!genre,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInfiniteBrowseCategory(
  category: "new-releases" | "ongoing" | "updates" | null
) {
  return useInfiniteQuery<BrowseResponse>({
    queryKey: ["browse", "infinite", category],
    queryFn: ({ pageParam }) =>
      api.get<BrowseResponse>(`/api/browse/${category}?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}
