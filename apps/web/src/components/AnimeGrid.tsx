import AnimeCard from "./AnimeCard";
import AnimeCardSkeleton from "./AnimeCardSkeleton";
import { useTitlePreference } from "../context/TitlePreferenceContext";
import { resolveTitle } from "../utils/title";

interface AnimeItem {
  id: number;
  title: { romaji: string | null; english: string | null; native?: string | null };
  coverImage: { large: string | null; medium: string | null; color: string | null } | null;
  averageScore: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
}

interface AnimeGridProps {
  items: AnimeItem[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function AnimeGrid({
  items,
  loading,
  skeletonCount = 12,
}: AnimeGridProps) {
  const { pref } = useTitlePreference();

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {items.map((anime) => (
        <AnimeCard
          key={anime.id}
          id={anime.id}
          title={resolveTitle(anime.title, pref)}
          coverImage={anime.coverImage?.large ?? anime.coverImage?.medium ?? null}
          score={anime.averageScore}
          format={anime.format}
          status={anime.status}
          episodes={anime.episodes}
          color={anime.coverImage?.color}
        />
      ))}
    </div>
  );
}
