import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface MediaItem {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; medium: string | null; color: string | null } | null;
  averageScore: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
}

interface PageResult {
  Page: {
    pageInfo?: { total: number; hasNextPage: boolean };
    media: MediaItem[];
  };
}

export interface AnimeDetail {
  id: number;
  title: { romaji: string | null; english: string | null; native: string | null };
  description: string | null;
  coverImage: { large: string | null; medium: string | null; color: string | null } | null;
  bannerImage: string | null;
  episodes: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  format: string | null;
  studios: { nodes: { id: number; name: string }[] };
  characters: {
    edges: {
      role: string;
      node: { id: number; name: { full: string }; image: { medium: string | null } };
    }[];
  };
  recommendations: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { romaji: string | null; english: string | null };
        coverImage: { medium: string | null; color: string | null };
        averageScore: number | null;
        format: string | null;
      } | null;
    }[];
  };
}

export function useTrending(page = 1, perPage = 18) {
  return useQuery<PageResult>({
    queryKey: ["anime", "trending", page, perPage],
    queryFn: () => api.get<PageResult>(`/api/anime/trending?page=${page}&perPage=${perPage}`),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePopular(page = 1, perPage = 12) {
  return useQuery<PageResult>({
    queryKey: ["anime", "popular", page, perPage],
    queryFn: () => api.get<PageResult>(`/api/anime/popular?page=${page}&perPage=${perPage}`),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAnimeSearch(query: string, page = 1, perPage = 30) {
  return useQuery<PageResult>({
    queryKey: ["anime", "search", query, page, perPage],
    queryFn: () =>
      api.get<PageResult>(`/api/anime/search?q=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnimeDetail(id: number) {
  return useQuery<{ Media: AnimeDetail }>({
    queryKey: ["anime", "detail", id],
    queryFn: () => api.get<{ Media: AnimeDetail }>(`/api/anime/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 15,
  });
}
