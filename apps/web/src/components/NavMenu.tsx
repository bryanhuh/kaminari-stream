import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: "Genres", category: "genres" },
  { label: "Types", category: "types" },
  { label: "New Releases", category: "new-releases" },
  { label: "Updates", category: "updates" },
  { label: "Ongoing", category: "ongoing" },
  { label: "Recent", category: "recent" },
  { label: "Schedule", category: "schedule" },
  { label: "A–Z List", category: "az" },
] as const;

export default function NavMenu({ open, onClose }: NavMenuProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function navigate_to(category: string) {
    if (category === "schedule") {
      navigate("/browse?category=schedule");
    } else {
      navigate(`/browse?category=${category}`);
    }
    onClose();
  }

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 mt-2 z-50 transition-all duration-200 ${
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="bg-[#111118]/98 backdrop-blur-md border border-[#2a2a38] rounded-xl shadow-2xl py-2 min-w-[200px]">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.category}
            onClick={() => navigate_to(item.category)}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
