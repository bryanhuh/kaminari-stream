import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { StreamData } from "@anime-app/types";

export interface StreamDataWithProvider extends StreamData {
  provider?: string;
}

export function useStream(
  episodeId: string | null,
  animeId?: number | null,
  epNumber?: number | null
) {
  return useQuery<StreamDataWithProvider>({
    queryKey: ["stream", episodeId],
    queryFn: () => {
      const params = new URLSearchParams({ episodeId: episodeId! });
      if (animeId) params.set("animeId", String(animeId));
      if (epNumber) params.set("ep", String(epNumber));
      return api.get<StreamDataWithProvider>(`/api/stream?${params.toString()}`);
    },
    enabled: !!episodeId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
