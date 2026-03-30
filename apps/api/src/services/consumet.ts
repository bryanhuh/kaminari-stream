import { ofetch } from "ofetch";
import { config } from "../config";
import type { Episode, StreamData } from "@anime-app/types";

const base = config.consumetBaseUrl;

interface ConsumetSearchResult {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate: string;
  subOrDub: string;
}

interface ConsumetSearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: ConsumetSearchResult[];
}

interface ConsumetEpisode {
  id: string;
  number: number;
  url: string;
}

interface ConsumetAnimeInfo {
  id: string;
  title: string;
  episodes: ConsumetEpisode[];
}

interface ConsumetStreamSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface ConsumetSubtitle {
  url: string;
  lang: string;
}

interface ConsumetWatchResponse {
  sources: ConsumetStreamSource[];
  subtitles?: ConsumetSubtitle[];
  headers?: Record<string, string>;
}

export async function searchAnime(query: string): Promise<ConsumetSearchResult[]> {
  const res = await ofetch<ConsumetSearchResponse>(
    `${base}/anime/gogoanime/${encodeURIComponent(query)}`,
    { timeout: 10000 }
  );
  return res.results ?? [];
}

export async function getAnimeInfo(providerAnimeId: string): Promise<ConsumetAnimeInfo> {
  return ofetch<ConsumetAnimeInfo>(
    `${base}/anime/gogoanime/info/${encodeURIComponent(providerAnimeId)}`,
    { timeout: 10000 }
  );
}

export async function getStreamSources(episodeId: string): Promise<StreamData> {
  const res = await ofetch<ConsumetWatchResponse>(
    `${base}/anime/gogoanime/watch/${encodeURIComponent(episodeId)}`,
    { timeout: 15000 }
  );

  return {
    sources: res.sources.map((s) => ({
      url: s.url,
      quality: s.quality,
      isM3U8: s.isM3U8,
    })),
    subtitles: res.subtitles ?? [],
    headers: res.headers,
  };
}

export function toEpisodes(info: ConsumetAnimeInfo): Episode[] {
  return info.episodes.map((ep) => ({
    id: ep.id,
    number: ep.number,
    title: null,
    image: null,
    description: null,
    airDate: null,
  }));
}
