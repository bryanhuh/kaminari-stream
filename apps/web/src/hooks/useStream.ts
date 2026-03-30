import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { StreamData } from "@anime-app/types";

export function useStream(episodeId: string | null) {
  return useQuery<StreamData>({
    queryKey: ["stream", episodeId],
    queryFn: () =>
      api.get<StreamData>(
        `/api/stream?episodeId=${encodeURIComponent(episodeId!)}`
      ),
    enabled: !!episodeId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
