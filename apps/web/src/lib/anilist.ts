import { gql } from "urql";

export const TRENDING_QUERY = gql`
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        coverImage {
          large
          medium
          color
        }
        bannerImage
        episodes
        status
        season
        seasonYear
        averageScore
        genres
        format
      }
    }
  }
`;

export const SEARCH_QUERY = gql`
  query Search($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        coverImage {
          large
          medium
          color
        }
        bannerImage
        episodes
        status
        season
        seasonYear
        averageScore
        genres
        format
      }
    }
  }
`;

export const ANIME_DETAIL_QUERY = gql`
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        large
        medium
        color
      }
      bannerImage
      episodes
      status
      season
      seasonYear
      averageScore
      genres
      format
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
      characters(sort: ROLE, perPage: 6) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 6) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
              color
            }
            averageScore
            format
          }
        }
      }
    }
  }
`;

export const POPULAR_QUERY = gql`
  query Popular($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
          color
        }
        episodes
        status
        season
        seasonYear
        averageScore
        genres
        format
      }
    }
  }
`;
