import { useQuery } from "@tanstack/react-query";
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
