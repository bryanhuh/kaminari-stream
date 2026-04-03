import { request } from "graphql-request";
import { config } from "../config";

const ANILIST_URL = config.anilistUrl ?? "https://graphql.anilist.co";

// ── Simple TTL cache ────────────────────────────────────────────────────────────
// Prevents hammering AniList when the same endpoint is called repeatedly
// (e.g. during dev HMR re-renders or duplicate client requests).

interface CacheEntry<T> { value: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>();

function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.value);
  return fn().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  });
}

// TTLs: list queries cached 5 min; detail queries cached 10 min; search 1 min
const TTL_LIST   = 5 * 60 * 1000;
const TTL_DETAIL = 10 * 60 * 1000;
const TTL_SEARCH = 60 * 1000;

// ── Retry wrapper ───────────────────────────────────────────────────────────────
// On 429, waits with exponential backoff before retrying (up to maxRetries).

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && attempt < maxRetries) {
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
      status
      season
      seasonYear
      averageScore
      genres
      format
      studios(isMain: true) {
        nodes { id name }
      }
      characters(sort: ROLE, perPage: 6) {
        edges {
          role
          node {
            id
            name { full }
            image { medium }
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

export async function getRandomAnime() {
  const page = Math.ceil(Math.random() * 3);
  const data = await withRetry(() =>
    request<{ Page: { media: unknown[] } }>(ANILIST_URL, RANDOM_QUERY, { page })
  );
  const items = data.Page.media;
  return items[Math.floor(Math.random() * items.length)];
}
