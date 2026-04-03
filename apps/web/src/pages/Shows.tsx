import { useState } from "react";
import { Link } from "react-router-dom";
import { useShows } from "../hooks/useAnime";
import AnimeGrid from "../components/AnimeGrid";
import GenreSelect from "../components/GenreSelect";
import { TrailerHero, StaticHero, parseYouTubeId } from "../components/TrailerHero";
import type { TrailerEntry } from "../components/TrailerHero";

export default function Shows() {
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("");
  const { data, isLoading } = useShows(page, 24, genre || undefined);

  const items = data?.Page.media ?? [];
  const hasNext = data?.Page.pageInfo.hasNextPage ?? false;

  const trailers: TrailerEntry[] = items.reduce<TrailerEntry[]>((acc, a) => {
    if (a.trailer?.site !== "youtube") return acc;
    const videoId = parseYouTubeId(a.trailer.id);
    if (videoId) acc.push({ anime: a, videoId });
    return acc;
  }, []);

  const firstAnime = items[0] ?? null;

  function handleGenreChange(g: string) {
    setGenre(g);
    setPage(1);
  }

  return (
    <div>
      {!isLoading && firstAnime && (
        trailers.length > 0
          ? <TrailerHero trailers={trailers} />
          : <StaticHero anime={firstAnime} />
      )}

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-2 text-sm text-[#5d6169] mb-5">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#bfc1c6]">TV Shows</span>
        </div>

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              TV Shows{genre && <span className="text-primary-400"> — {genre}</span>}
            </h1>
            <div className="w-12 h-1 rounded-full bg-primary-500 mt-2" />
          </div>
          <GenreSelect value={genre} onChange={handleGenreChange} />
        </div>

        <AnimeGrid items={items} loading={isLoading} skeletonCount={24} />

        {!isLoading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 rounded-lg bg-[#1a1a24] text-sm font-medium text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#5d6169]">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="px-5 py-2 rounded-lg bg-[#1a1a24] text-sm font-medium text-[#bfc1c6] hover:bg-[#2a2a38] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
