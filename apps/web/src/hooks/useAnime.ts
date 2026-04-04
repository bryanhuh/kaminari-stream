import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { RecentEpisodesResponse, SpotlightAnime } from "@anime-app/types";

export interface MediaItem {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; medium: string | null; color: string | null } | null;
  averageScore: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  description?: string | null;
  bannerImage?: string | null;
  trailer?: { id: string; site: string } | null;
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
  duration: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
  endDate: { year: number | null; month: number | null; day: number | null } | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  format: string | null;
  source: string | null;
  trailer: { id: string; site: string } | null;
  studios: { nodes: { id: number; name: string }[] };
  characters: {
    edges: {
      role: string;
      voiceActors: { id: number; name: { full: string }; image: { medium: string | null } }[];
      node: { id: number; name: { full: string }; image: { large: string | null; medium: string | null } };
    }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: { romaji: string | null; english: string | null };
        coverImage: { medium: string | null; color: string | null };
        format: string | null;
        type: string | null;
      };
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

export interface SearchFilters {
  genre?: string;
  format?: string;
  year?: number;
  status?: string;
}

export function useAnimeSearch(query: string, page = 1, perPage = 30, filters?: SearchFilters) {
  const hasFilters = filters && (filters.genre || filters.format || filters.year || filters.status);
  const hasQuery = query.length > 0;

  return useQuery<PageResult>({
    queryKey: ["anime", "search", query, page, perPage, filters ?? {}],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (query) params.set("q", query);
      if (filters?.genre) params.set("genre", filters.genre);
      if (filters?.format) params.set("format", filters.format);
      if (filters?.year) params.set("year", String(filters.year));
      if (filters?.status) params.set("status", filters.status);
      return api.get<PageResult>(`/api/anime/search?${params}`);
    },
    enabled: hasQuery || !!hasFilters,
    staleTime: 1000 * 60 * 5,
  });
}

interface AZResult {
  letter: string;
  page: number;
  hasNextPage: boolean;
  media: MediaItem[];
}

export function useAZBrowse(letter: string, page = 1) {
  return useQuery<AZResult>({
    queryKey: ["anime", "az", letter, page],
    queryFn: () =>
      api.get<AZResult>(`/api/anime/az?letter=${encodeURIComponent(letter)}&page=${page}`),
    staleTime: 1000 * 60 * 10,
    enabled: !!letter,
  });
}

export function useSpotlight() {
  return useQuery<{ results: SpotlightAnime[] }>({
    queryKey: ["anime", "spotlight"],
    queryFn: () => api.get<{ results: SpotlightAnime[] }>("/api/anime/spotlight"),
    staleTime: 1000 * 60 * 10,
  });
}

export function useRecentEpisodes(page = 1) {
  return useQuery<RecentEpisodesResponse>({
    queryKey: ["anime", "recent-episodes", page],
    queryFn: () => api.get<RecentEpisodesResponse>(`/api/anime/recent-episodes?page=${page}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSeasonAnime() {
  return useQuery<PageResult>({
    queryKey: ["anime", "season"],
    queryFn: () => api.get<PageResult>("/api/anime/season"),
    staleTime: 1000 * 60 * 10,
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

interface FormatPageResult {
  Page: {
    pageInfo: { hasNextPage: boolean; total: number };
    media: MediaItem[];
  };
}

export function useShows(page = 1, perPage = 24, genre?: string) {
  return useQuery<FormatPageResult>({
    queryKey: ["anime", "shows", page, perPage, genre ?? ""],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (genre) params.set("genre", genre);
      return api.get<FormatPageResult>(`/api/anime/shows?${params}`);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useNextSeason(perPage = 12) {
  return useQuery<PageResult>({
    queryKey: ["anime", "next-season", perPage],
    queryFn: () => api.get<PageResult>(`/api/anime/next-season`),
    staleTime: 1000 * 60 * 60,
  });
}

export function useGenreRecommendations(genre?: string) {
  return useQuery<PageResult>({
    queryKey: ["anime", "recommendations", genre ?? ""],
    queryFn: () => api.get<PageResult>(`/api/anime/recommendations?genre=${encodeURIComponent(genre!)}`),
    enabled: !!genre,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMovies(page = 1, perPage = 24, genre?: string) {
  return useQuery<FormatPageResult>({
    queryKey: ["anime", "movies", page, perPage, genre ?? ""],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (genre) params.set("genre", genre);
      return api.get<FormatPageResult>(`/api/anime/movies?${params}`);
    },
    staleTime: 1000 * 60 * 10,
  });
}
