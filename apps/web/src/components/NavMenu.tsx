import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: "GENRES", category: "genres" },
  { label: "TYPES", category: "types" },
  { label: "NEW RELEASES", category: "new-releases" },
  { label: "UPDATES", category: "updates" },
  { label: "ONGOING", category: "ongoing" },
  { label: "RECENT", category: "recent" },
] as const;

export default function NavMenu({ open, onClose }: NavMenuProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function navigate_to(category: string) {
    navigate(`/browse?category=${category}`);
    onClose();
  }

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 mt-1 z-50 transition-all duration-200 ${
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl py-3 min-w-[220px]">
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.category}
            onClick={() => navigate_to(item.category)}
            className={`w-full text-left px-7 py-3.5 text-lg font-bold tracking-wider text-gray-300 hover:text-primary-400 hover:bg-primary-500/5 transition-colors ${
              i < MENU_ITEMS.length - 1 ? "border-b border-gray-800/60" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
