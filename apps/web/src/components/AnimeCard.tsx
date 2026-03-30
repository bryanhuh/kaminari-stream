import { Link } from "react-router-dom";

interface AnimeCardProps {
  id: number;
  title: string;
  coverImage: string | null;
  score: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  color?: string | null;
}

export default function AnimeCard({
  id,
  title,
  coverImage,
  score,
  format,
  episodes,
  color,
}: AnimeCardProps) {
  return (
    <Link
      to={`/anime/${id}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-800">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
            No image
          </div>
        )}
        {score && (
          <div
            className="absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: color ?? "#6366f1",
              color: "#fff",
            }}
          >
            {(score / 10).toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-500">
          {[format, episodes ? `${episodes} eps` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
