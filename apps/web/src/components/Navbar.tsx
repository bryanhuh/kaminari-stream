import { Link, useNavigate, useLocation } from "react-router-dom";
import { FormEvent, useState, useCallback } from "react";
import NavMenu from "./NavMenu";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#1e1e28]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">

        {/* Hamburger — mobile only */}
        <div className="relative shrink-0 md:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
          <NavMenu open={menuOpen} onClose={closeMenu} />
        </div>

        {/* Logo */}
        <Link
          to="/"
          className="font-extrabold text-xl tracking-tight shrink-0 text-primary-500 hover:text-primary-400 transition-colors"
        >
          Anistream
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive("/") ? "text-white bg-white/10" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            Home
          </Link>
          <Link
            to="/browse"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive("/browse") ? "text-white bg-white/10" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            Browse
          </Link>
          <Link
            to="/browse?category=schedule"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              location.search.includes("schedule") && isActive("/browse") ? "text-white bg-white/10" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            Schedule
          </Link>
          <Link
            to="/browse?category=az"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              location.search.includes("az") && isActive("/browse") ? "text-white bg-white/10" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
            }`}
          >
            A–Z
          </Link>

          {/* More dropdown (desktop) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More"
              aria-expanded={menuOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors"
            >
              More
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <NavMenu open={menuOpen} onClose={closeMenu} />
          </div>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm ml-auto">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d6169] pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full bg-[#111118] text-sm text-white placeholder-[#5d6169] rounded-full pl-9 pr-4 py-2 outline-none border border-[#1e1e28] focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-colors"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
