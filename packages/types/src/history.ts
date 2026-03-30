export interface WatchProgress {
  animeId: number;
  episodeId: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  watchedAt: string;
}

export interface WatchHistoryEntry extends WatchProgress {
  id: number;
  animeTitle: string;
  animeCover: string | null;
}
