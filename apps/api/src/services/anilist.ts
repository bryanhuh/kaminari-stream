import { request } from "graphql-request";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { anilistCache } from "../db/schema";
import { config } from "../config";

const ANILIST_URL = config.anilistUrl ?? "https://graphql.anilist.co";

// ── Simple TTL cache ────────────────────────────────────────────────────────────
// Prevents hammering AniList when the same endpoint is called repeatedly
// (e.g. during dev HMR re-renders or duplicate client requests).

interface CacheEntry<T> { value: T; expiresAt: number }
// L1: in-process memory — survives within a single process lifetime
const memCache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();

  // L1: memory hit
  const memHit = memCache.get(key) as CacheEntry<T> | undefined;
  if (memHit && memHit.expiresAt > now) return memHit.value;

  // L2: DB hit (survives restarts — prevents 429s on cold start)
  try {
    const rows = await db.select().from(anilistCache).where(eq(anilistCache.key, key)).limit(1);
    const dbHit = rows[0];
    if (dbHit && parseInt(dbHit.expiresAt) > now) {
      const value = JSON.parse(dbHit.value) as T;
      memCache.set(key, { value, expiresAt: parseInt(dbHit.expiresAt) });
      return value;
    }
  } catch {
    // DB unavailable — fall through to AniList
  }

  // Fetch from AniList
  const value = await fn();
  const expiresAt = now + ttlMs;
  const serialized = JSON.stringify(value);

  // Write L1
  memCache.set(key, { value, expiresAt });

  // Write L2 — fire-and-forget so it never delays the response
  db.insert(anilistCache)
    .values({ key, value: serialized, expiresAt: String(expiresAt) })
    .onConflictDoUpdate({
      target: anilistCache.key,
      set: { value: serialized, expiresAt: String(expiresAt) },
    })
    .catch(() => {});

  return value;
}

// TTLs: longer caches reduce upstream AniList calls and rate-limit exposure.
// List pages change infrequently; detail data almost never changes mid-session.
const TTL_LIST   = 15 * 60 * 1000;  // 15 min (was 5)
const TTL_DETAIL = 30 * 60 * 1000;  // 30 min (was 10)
const TTL_SEARCH =  5 * 60 * 1000;  //  5 min (was 1)

// ── Request queue (token bucket) ───────────────────────────────────────────────
// AniList allows 90 req/min. We proactively throttle to 60 req/min (1/sec)
// to stay safely under the limit and avoid reactive 429 handling in most cases.

const BUCKET_CAPACITY = 60;
const REFILL_INTERVAL_MS = 1000;

let tokens = BUCKET_CAPACITY;
let lastRefill = Date.now();
const queue: Array<() => void> = [];
let draining = false;

function refillTokens() {
  const now = Date.now();
  const elapsed = now - lastRefill;
  const refillAmount = Math.floor(elapsed / REFILL_INTERVAL_MS);
  if (refillAmount > 0) {
    tokens = Math.min(BUCKET_CAPACITY, tokens + refillAmount);
    lastRefill = now;
  }
}

function drainQueue() {
  if (draining) return;
  draining = true;
  const tick = () => {
    refillTokens();
    while (queue.length > 0 && tokens > 0) {
      tokens--;
      const resolve = queue.shift()!;
      resolve();
    }
    if (queue.length > 0) {
      setTimeout(tick, REFILL_INTERVAL_MS);
    } else {
      draining = false;
    }
  };
  tick();
}

function acquireToken(): Promise<void> {
  refillTokens();
  if (tokens > 0) {
    tokens--;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(resolve);
    drainQueue();
  });
}

// ── Retry wrapper ───────────────────────────────────────────────────────────────
// On 429, waits with exponential backoff before retrying (up to maxRetries).
// The token bucket handles normal load; this handles bursts that slip through.

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 2000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await acquireToken();
    try {
      return await fn();
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && attempt < maxRetries) {
        // On 429, pause the whole bucket for 60s to let AniList recover
        tokens = 0;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

// ── Shared media fields ────────────────────────────────────────────────────────

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large medium color }
  episodes
  status
  season
  seasonYear
  averageScore
  genres
  format
`;

const TRENDING_QUERY = `
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const POPULAR_QUERY = `
  query Popular($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const SEARCH_QUERY = `
  query Search($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total hasNextPage }
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      description(asHtml: false)
      coverImage { large medium color }
      bannerImage
      episodes
      duration
      status
      season
      seasonYear
      startDate { year month day }
      endDate { year month day }
      averageScore
      popularity
      genres
      format
      source
      trailer { id site }
      studios(isMain: true) {
        nodes { id name }
      }
      characters(sort: ROLE, perPage: 12) {
        edges {
          role
          voiceActors(language: JAPANESE) {
            id
            name { full }
            image { medium }
          }
          node {
            id
            name { full }
            image { large medium }
          }
        }
      }
      relations {
        edges {
          relationType(version: 2)
          node {
            id
            title { romaji english }
            coverImage { medium color }
            format
            type
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 6) {
        nodes {
          mediaRecommendation {
            id
            title { romaji english }
            coverImage { medium color }
            averageScore
            format
          }
        }
      }
    }
  }
`;

// ── Public helpers ─────────────────────────────────────────────────────────────

export function getTrending(page = 1, perPage = 18) {
  return cached(`trending:${page}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { media: unknown[] } }>(ANILIST_URL, TRENDING_QUERY, {
        page,
        perPage,
      })
    )
  );
}

export function getPopular(page = 1, perPage = 12) {
  return cached(`popular:${page}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { media: unknown[] } }>(ANILIST_URL, POPULAR_QUERY, {
        page,
        perPage,
      })
    )
  );
}

export function searchAnimeAnilist(search: string, page = 1, perPage = 30) {
  return cached(`search:${search}:${page}:${perPage}`, TTL_SEARCH, () =>
    withRetry(() =>
      request<{ Page: { pageInfo: { total: number; hasNextPage: boolean }; media: unknown[] } }>(
        ANILIST_URL,
        SEARCH_QUERY,
        { search, page, perPage }
      )
    )
  );
}

const SEASON_QUERY = `
  query Season($season: MediaSeason, $year: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      media(season: $season, seasonYear: $year, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

function currentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const season =
    month <= 3 ? "WINTER" : month <= 6 ? "SPRING" : month <= 9 ? "SUMMER" : "FALL";
  return { season, year };
}

function nextSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month <= 3) return { season: "SPRING", year };
  if (month <= 6) return { season: "SUMMER", year };
  if (month <= 9) return { season: "FALL", year };
  return { season: "WINTER", year: year + 1 };
}

const AZ_QUERY = `
  query AZBrowse($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(search: $search, type: ANIME, isAdult: false, sort: TITLE_ROMAJI) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export function getSeasonAnime(perPage = 18) {
  const { season, year } = currentSeason();
  return cached(`season:${season}:${year}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { media: unknown[] } }>(ANILIST_URL, SEASON_QUERY, {
        season,
        year,
        perPage,
      })
    )
  );
}

export function browseAZ(letter: string, page = 1, perPage = 30) {
  return cached(`az:${letter}:${page}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{
        Page: {
          pageInfo: { hasNextPage: boolean; total: number };
          media: unknown[];
        };
      }>(ANILIST_URL, AZ_QUERY, { search: letter, page, perPage })
    )
  );
}

export function getAnimeDetail(id: number) {
  return cached(`detail:${id}`, TTL_DETAIL, () =>
    withRetry(() =>
      request<{ Media: unknown }>(ANILIST_URL, DETAIL_QUERY, { id })
    )
  );
}

const SHOWS_QUERY = `
  query ShowsBrowse($page: Int, $perPage: Int, $genre: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(format: TV, type: ANIME, isAdult: false, sort: TRENDING_DESC, status: RELEASING, genre: $genre) {
        ${MEDIA_FIELDS}
        description(asHtml: false)
        bannerImage
        trailer { id site }
      }
    }
  }
`;

const FORMAT_QUERY = `
  query FormatBrowse($format: MediaFormat, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(format: $format, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export function getTVShows(page = 1, perPage = 24, genre?: string) {
  const key = `tvshows-trending:${page}:${perPage}:${genre ?? ""}`;
  return cached(key, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { pageInfo: { hasNextPage: boolean; total: number }; media: unknown[] } }>(
        ANILIST_URL, SHOWS_QUERY, { page, perPage, genre: genre || undefined }
      )
    )
  );
}

const MOVIES_QUERY = `
  query MoviesBrowse($page: Int, $perPage: Int, $genre: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(format: MOVIE, type: ANIME, isAdult: false, sort: TRENDING_DESC, genre: $genre) {
        ${MEDIA_FIELDS}
        description(asHtml: false)
        bannerImage
        trailer { id site }
      }
    }
  }
`;

export function getMovies(page = 1, perPage = 24, genre?: string) {
  const key = `movies-trending:${page}:${perPage}:${genre ?? ""}`;
  return cached(key, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { pageInfo: { hasNextPage: boolean; total: number }; media: unknown[] } }>(
        ANILIST_URL, MOVIES_QUERY, { page, perPage, genre: genre || undefined }
      )
    )
  );
}

const RANDOM_QUERY = `
  query Random($page: Int) {
    Page(page: $page, perPage: 50) {
      media(type: ANIME, isAdult: false, sort: POPULARITY_DESC, format: TV) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const NEXT_SEASON_QUERY = `
  query NextSeason($season: MediaSeason, $year: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      media(season: $season, seasonYear: $year, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
        bannerImage
      }
    }
  }
`;

export function getNextSeasonAnime(perPage = 12) {
  const { season, year } = nextSeason();
  return cached(`next-season:${season}:${year}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { media: unknown[] } }>(ANILIST_URL, NEXT_SEASON_QUERY, { season, year, perPage })
    )
  );
}

const GENRE_QUERY = `
  query GenreAnime($genre: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(genre: $genre, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export function getByGenre(genre: string, perPage = 6) {
  return cached(`genre:${genre}:${perPage}`, TTL_LIST, () =>
    withRetry(() =>
      request<{ Page: { media: unknown[] } }>(ANILIST_URL, GENRE_QUERY, { genre, perPage })
    )
  );
}

// ── Advanced search with filters ──────────────────────────────────────────────

export interface SearchFilters {
  search?: string;
  genre?: string;
  format?: string;
  year?: number;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

const ADVANCED_SEARCH_QUERY = `
  query AdvancedSearch(
    $search: String,
    $genre: String,
    $format: MediaFormat,
    $seasonYear: Int,
    $status: MediaStatus,
    $sort: [MediaSort],
    $page: Int,
    $perPage: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total hasNextPage }
      media(
        search: $search,
        genre: $genre,
        format: $format,
        seasonYear: $seasonYear,
        status: $status,
        sort: $sort,
        type: ANIME,
        isAdult: false
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export function advancedSearch(filters: SearchFilters) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 30;
  const sort = filters.search ? "SEARCH_MATCH" : (filters.sort ?? "TRENDING_DESC");

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sort],
  };
  if (filters.search) variables.search = filters.search;
  if (filters.genre) variables.genre = filters.genre;
  if (filters.format) variables.format = filters.format;
  if (filters.year) variables.seasonYear = filters.year;
  if (filters.status) variables.status = filters.status;

  const keyParts = [
    "advsearch",
    filters.search ?? "",
    filters.genre ?? "",
    filters.format ?? "",
    filters.year ?? "",
    filters.status ?? "",
    sort,
    page,
    perPage,
  ];

  return cached(keyParts.join(":"), TTL_SEARCH, () =>
    withRetry(() =>
      request<{ Page: { pageInfo: { total: number; hasNextPage: boolean }; media: unknown[] } }>(
        ANILIST_URL,
        ADVANCED_SEARCH_QUERY,
        variables
      )
    )
  );
}

export async function getRandomAnime() {
  const page = Math.ceil(Math.random() * 3);
  const data = await withRetry(() =>
    request<{ Page: { media: unknown[] } }>(ANILIST_URL, RANDOM_QUERY, { page })
  );
  const items = data.Page.media;
  return items[Math.floor(Math.random() * items.length)];
}
