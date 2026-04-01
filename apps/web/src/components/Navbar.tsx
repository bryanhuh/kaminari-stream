import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState, useCallback } from "react";
import NavMenu from "./NavMenu";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Hamburger */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
          <NavMenu open={menuOpen} onClose={closeMenu} />
        </div>

        <Link to="/" className="font-bold text-lg tracking-tight shrink-0 text-primary-400 hover:text-primary-300 transition-colors">
          Anistream
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime..."
            className="w-full bg-gray-800 text-sm text-white placeholder-gray-500 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>

        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/search" className="hover:text-white transition-colors">Browse</Link>
        </nav>
      </div>
    </header>
  );
}
