import { useState } from "react";
import { Link } from "react-router-dom";
import { useMovies } from "../hooks/useAnime";
import AnimeGrid from "../components/AnimeGrid";

export default function Movies() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMovies(page, 24);

  const hasNext = data?.Page.pageInfo.hasNextPage ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-[#5d6169] mb-5">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#bfc1c6]">Movies</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Movies</h1>
        <div className="w-12 h-1 rounded-full bg-primary-500" />
      </div>

      <AnimeGrid items={data?.Page.media ?? []} loading={isLoading} skeletonCount={24} />

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
  );
}
