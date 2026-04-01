export interface AnimeTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AnimeCoverImage {
  large: string | null;
  medium: string | null;
  color: string | null;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  description: string | null;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  episodes: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  format: string | null;
}

export interface Episode {
  id: string;
  number: number;
  title: string | null;
  image: string | null;
  description: string | null;
  airDate: string | null;
}

export interface RecentEpisode {
  id: string;
  title: string;
  url: string;
  image: string;
  episodeNumber: number;
  releaseDate: string;
  subOrDub: "sub" | "dub";
  anilistId: number | null;
}

export interface RecentEpisodesResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: RecentEpisode[];
}

export interface StreamSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface StreamData {
  sources: StreamSource[];
  subtitles: { url: string; lang: string }[];
  headers?: Record<string, string>;
}
