import { ofetch } from "ofetch";
import { config } from "../config";
import type { Episode, StreamData } from "@anime-app/types";

const base = config.consumetBaseUrl;

// Render free tier cold-starts take up to ~60 s; use a generous timeout so the
// first request after spin-down actually waits long enough to succeed.
const TIMEOUT = 70_000;

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
    { timeout: TIMEOUT }
  );
  return res.results ?? [];
}

export async function getAnimeInfo(providerAnimeId: string): Promise<ConsumetAnimeInfo> {
  // animekai uses ?id= query param (not a path segment)
  return ofetch<ConsumetAnimeInfo>(
    `${base}/anime/animekai/info`,
    { query: { id: providerAnimeId }, timeout: TIMEOUT }
  );
}

export async function getStreamSources(episodeId: string): Promise<StreamData> {
  const res = await ofetch<ConsumetWatchResponse>(
    `${base}/anime/animekai/watch/${episodeId}`,
    { timeout: TIMEOUT }
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

// ── Recent Episodes ────────────────────────────────────────────────────────────

export interface ConsumetRecentEpisode {
  id: string;
  title: string;
  url: string;
  image: string;
  episodeNumber: number;
  releaseDate: string;
  subOrDub: "sub" | "dub";
}

interface ConsumetRecentEpisodesResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: ConsumetRecentEpisode[];
}

// ── Schedule ───────────────────────────────────────────────────────────────────

export interface ScheduleItem {
  id: string;
  title: string;
  japaneseTitle: string;
  airingTime: string;
  airingEpisode: string;
}

export async function getSchedule(date: string): Promise<ScheduleItem[]> {
  const res = await ofetch<{ results: ScheduleItem[] }>(
    `${base}/anime/animekai/schedule/${encodeURIComponent(date)}`,
    { timeout: TIMEOUT }
  );
  return res.results ?? [];
}

// ── Browse ─────────────────────────────────────────────────────────────────────

export interface BrowseAnime {
  id: string;
  title: string;
  japaneseTitle: string;
  image: string;
  type: string;
  sub: number;
  dub: number;
  episodes: number;
}

interface BrowseResponse {
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
  results: BrowseAnime[];
}

export async function browseByGenre(genre: string, page = 1): Promise<BrowseResponse> {
  return ofetch<BrowseResponse>(
    `${base}/anime/animekai/genre/${encodeURIComponent(genre)}`,
    { query: { page }, timeout: TIMEOUT }
  );
}

export async function browseNewReleases(page = 1): Promise<BrowseResponse> {
  return ofetch<BrowseResponse>(
    `${base}/anime/animekai/new-releases`,
    { query: { page }, timeout: TIMEOUT }
  );
}

export async function browseTopAiring(page = 1): Promise<BrowseResponse> {
  return ofetch<BrowseResponse>(
    `${base}/anime/animekai/top-airing`,
    { query: { page }, timeout: TIMEOUT }
  );
}

export async function browseMostPopular(page = 1): Promise<BrowseResponse> {
  return ofetch<BrowseResponse>(
    `${base}/anime/animekai/most-popular`,
    { query: { page }, timeout: TIMEOUT }
  );
}

// ── Spotlight ──────────────────────────────────────────────────────────────────

export interface ConsumetSpotlightAnime {
  id: string;
  title: string;
  japaneseTitle: string;
  banner: string;
  url: string;
  type: string;
  genres: string[];
  releaseDate: string;
  quality: string;
  sub: number;
  dub: number;
  description: string;
}

interface ConsumetSpotlightResponse {
  results: ConsumetSpotlightAnime[];
}

export async function getSpotlight(): Promise<ConsumetSpotlightAnime[]> {
  const res = await ofetch<ConsumetSpotlightResponse>(
    `${base}/anime/animekai/spotlight`,
    { timeout: TIMEOUT }
  );
  return res.results ?? [];
}

export async function getRecentEpisodes(page = 1): Promise<ConsumetRecentEpisodesResponse> {
  return ofetch<ConsumetRecentEpisodesResponse>(
    `${base}/anime/animekai/recent-episodes`,
    { query: { page }, timeout: TIMEOUT }
  );
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

// ── Hianime fallback ───────────────────────────────────────────────────────────

interface HianimeSearchResult {
  id: string;
  title: string;
}

interface HianimeEpisode {
  id: string;
  number: number;
  title?: string;
}

interface HianimeInfo {
  id: string;
  title: string;
  episodes: { sub: HianimeEpisode[]; dub: HianimeEpisode[] } | HianimeEpisode[];
}

export async function getHianimeStreamSources(title: string, epNumber: number): Promise<StreamData | null> {
  try {
    const searchRes = await ofetch<{ results: HianimeSearchResult[] }>(
      `${base}/anime/hianime/${encodeURIComponent(title)}`,
      { timeout: TIMEOUT }
    );
    const match = searchRes.results?.[0];
    if (!match) return null;

    const info = await ofetch<HianimeInfo>(
      `${base}/anime/hianime/info`,
      { query: { id: match.id }, timeout: TIMEOUT }
    );

    const episodes: HianimeEpisode[] = Array.isArray(info.episodes)
      ? info.episodes
      : (info.episodes as { sub: HianimeEpisode[] }).sub ?? [];

    const episode = episodes.find((e) => e.number === epNumber);
    if (!episode) return null;

    const watchRes = await ofetch<ConsumetWatchResponse>(
      `${base}/anime/hianime/watch/${encodeURIComponent(episode.id)}`,
      { timeout: TIMEOUT }
    );

    if (!watchRes.sources?.length) return null;

    return {
      sources: watchRes.sources.map((s) => ({
        url: s.url,
        quality: s.quality ?? "default",
        isM3U8: s.isM3U8,
      })),
      subtitles: (watchRes.subtitles ?? []).map((s) => ({ url: s.url, lang: s.lang ?? s.kind ?? "unknown" })),
      headers: watchRes.headers,
    };
  } catch {
    return null;
  }
}

// ── Animepahe fallback ─────────────────────────────────────────────────────────

interface AnimePaheSearchResult {
  id: string;
  title: string;
}

interface AnimePaheEpisode {
  id: string;
  number: number;
}

interface AnimePaheInfo {
  id: string;
  title: string;
  episodes: AnimePaheEpisode[];
}

export async function getAnimePaheStreamSources(title: string, epNumber: number): Promise<StreamData | null> {
  try {
    const searchRes = await ofetch<{ results: AnimePaheSearchResult[] }>(
      `${base}/anime/animepahe/${encodeURIComponent(title)}`,
      { timeout: TIMEOUT }
    );
    const match = searchRes.results?.[0];
    if (!match) return null;

    const info = await ofetch<AnimePaheInfo>(
      `${base}/anime/animepahe/info`,
      { query: { id: match.id }, timeout: TIMEOUT }
    );

    const episode = info.episodes?.find((e) => e.number === epNumber);
    if (!episode) return null;

    const watchRes = await ofetch<ConsumetWatchResponse>(
      `${base}/anime/animepahe/watch/${encodeURIComponent(episode.id)}`,
      { timeout: TIMEOUT }
    );

    if (!watchRes.sources?.length) return null;

    return {
      sources: watchRes.sources.map((s) => ({
        url: s.url,
        quality: s.quality ?? "default",
        isM3U8: s.isM3U8,
      })),
      subtitles: (watchRes.subtitles ?? []).map((s) => ({ url: s.url, lang: s.lang ?? s.kind ?? "unknown" })),
      headers: watchRes.headers,
    };
  } catch {
    return null;
  }
}
