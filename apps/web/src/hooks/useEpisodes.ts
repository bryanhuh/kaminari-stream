import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Episode } from "@anime-app/types";

interface EpisodesResponse {
  providerAnimeId: string;
  episodes: Episode[];
}

export function useEpisodes(animeId: number, title: string | null) {
  return useQuery<EpisodesResponse>({
    queryKey: ["episodes", animeId],
    queryFn: () =>
      api.get<EpisodesResponse>(
        `/api/episodes/${animeId}?title=${encodeURIComponent(title ?? "")}`
      ),
    enabled: !!title,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
