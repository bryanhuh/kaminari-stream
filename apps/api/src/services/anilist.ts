import { request } from "graphql-request";
import { config } from "../config";

const ANILIST_URL = config.anilistUrl ?? "https://graphql.anilist.co";

// Retry wrapper: on 429, wait and retry up to maxRetries times
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

export async function getTrending(page = 1, perPage = 18) {
  return withRetry(() =>
    request<{ Page: { media: unknown[] } }>(ANILIST_URL, TRENDING_QUERY, {
      page,
      perPage,
    })
  );
}

export async function getPopular(page = 1, perPage = 12) {
  return withRetry(() =>
    request<{ Page: { media: unknown[] } }>(ANILIST_URL, POPULAR_QUERY, {
      page,
      perPage,
    })
  );
}

export async function searchAnimeAnilist(
  search: string,
  page = 1,
  perPage = 30
) {
  return withRetry(() =>
    request<{ Page: { pageInfo: { total: number; hasNextPage: boolean }; media: unknown[] } }>(
      ANILIST_URL,
      SEARCH_QUERY,
      { search, page, perPage }
    )
  );
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

export async function browseAZ(letter: string, page = 1, perPage = 30) {
  return withRetry(() =>
    request<{
      Page: {
        pageInfo: { hasNextPage: boolean; total: number };
        media: unknown[];
      };
    }>(ANILIST_URL, AZ_QUERY, { search: letter, page, perPage })
  );
}

export async function getAnimeDetail(id: number) {
  return withRetry(() =>
    request<{ Media: unknown }>(ANILIST_URL, DETAIL_QUERY, { id })
  );
}
