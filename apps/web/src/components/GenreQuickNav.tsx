import { useNavigate } from "react-router-dom";

const GENRES = [
  { label: "Action", icon: "⚔️" },
  { label: "Adventure", icon: "🗺️" },
  { label: "Fantasy", icon: "✨" },
  { label: "Romance", icon: "💞" },
  { label: "Comedy", icon: "😄" },
  { label: "Sci-Fi", icon: "🚀" },
  { label: "Horror", icon: "👻" },
  { label: "Mystery", icon: "🔍" },
  { label: "Slice of Life", icon: "☕" },
  { label: "Supernatural", icon: "🌙" },
  { label: "Mecha", icon: "🤖" },
  { label: "Sports", icon: "🏆" },
  { label: "Isekai", icon: "🌀" },
  { label: "Psychological", icon: "🧠" },
  { label: "Drama", icon: "🎭" },
  { label: "Music", icon: "🎵" },
];

export default function GenreQuickNav() {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b border-[#1e1e28] bg-[#0a0a0f]">
      <div className="flex gap-2 px-6 py-3 overflow-x-auto scrollbar-none">
        {GENRES.map((g) => (
          <button
            key={g.label}
            onClick={() => navigate(`/browse?category=genres&genre=${encodeURIComponent(g.label)}`)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#111118] border border-[#2a2a38] text-sm text-[#bfc1c6] hover:border-primary-500 hover:text-white hover:bg-primary-500/10 transition-colors whitespace-nowrap"
          >
            <span className="text-base leading-none">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
