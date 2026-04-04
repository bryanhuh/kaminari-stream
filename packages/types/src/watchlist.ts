export interface WatchlistEntry {
  id: number;
  animeId: number;
  animeTitle: string;
  animeCover: string | null;
  format: string | null;
  episodes: number | null;
  score: number | null;
  status: string | null;
  addedAt: string;
}
