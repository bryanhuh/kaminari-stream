import { ofetch } from "ofetch";
import { config } from "../config";
import type { Episode, StreamData } from "@anime-app/types";

const base = config.consumetBaseUrl;

// ── Search ─────────────────────────────────────────────────────────────────────

interface ConsumetSearchResult {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub?: string;
}

interface ConsumetSearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: ConsumetSearchResult[];
}

// ── Info ───────────────────────────────────────────────────────────────────────

interface ConsumetEpisode {
  id: string;
  number: number;
  url: string;
  title?: string;
}

interface ConsumetAnimeInfo {
  id: string;
  title: string;
  episodes: ConsumetEpisode[];
}

// ── Watch ──────────────────────────────────────────────────────────────────────

interface ConsumetStreamSource {
  url: string;
  quality?: string;
  isM3U8: boolean;
}

interface ConsumetSubtitle {
  url: string;
  lang?: string;
  kind?: string;
}

interface ConsumetWatchResponse {
  sources: ConsumetStreamSource[];
  subtitles?: ConsumetSubtitle[];
  headers?: Record<string, string>;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function searchAnime(query: string): Promise<ConsumetSearchResult[]> {
  const res = await ofetch<ConsumetSearchResponse>(
    `${base}/anime/animekai/${encodeURIComponent(query)}`,
    { timeout: 10000 }
  );
  return res.results ?? [];
}

export async function getAnimeInfo(providerAnimeId: string): Promise<ConsumetAnimeInfo> {
  // animekai uses ?id= query param (not a path segment)
  return ofetch<ConsumetAnimeInfo>(
    `${base}/anime/animekai/info`,
    { query: { id: providerAnimeId }, timeout: 10000 }
  );
}

export async function getStreamSources(episodeId: string): Promise<StreamData> {
  const res = await ofetch<ConsumetWatchResponse>(
    `${base}/anime/animekai/watch/${encodeURIComponent(episodeId)}`,
    { timeout: 15000 }
  );

  return {
    sources: res.sources.map((s) => ({
      url: s.url,
      quality: s.quality ?? "default",
      isM3U8: s.isM3U8,
    })),
    subtitles: (res.subtitles ?? []).map((s) => ({ url: s.url, lang: s.lang ?? s.kind ?? "unknown" })),
    headers: res.headers,
  };
}

export function toEpisodes(info: ConsumetAnimeInfo): Episode[] {
  return info.episodes.map((ep) => ({
    id: ep.id,
    number: ep.number,
    title: ep.title ?? null,
    image: null,
    description: null,
    airDate: null,
  }));
}
