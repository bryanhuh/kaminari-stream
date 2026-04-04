import { Link, useNavigate, useLocation } from "react-router-dom";
import { FormEvent, useState, useCallback, useRef } from "react";
import AuthModal from "./AuthModal";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearchOpen(false);
    }
  }

  const handleRandom = useCallback(async () => {
    if (randomLoading) return;
    setRandomLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
      const res = await fetch(`${base}/api/anime/random`);
      const json = await res.json();
      const anime = json.data as { id: number };
      if (anime?.id) navigate(`/anime/${anime.id}`);
    } catch {
      // silently fail
    } finally {
      setRandomLoading(false);
    }
  }, [randomLoading, navigate]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shows", to: "/shows" },
    { label: "Movies", to: "/movies" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#1e1e28]">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="flex md:hidden flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-extrabold text-2xl tracking-tight shrink-0 text-primary-500 hover:text-primary-400 transition-colors"
          >
            raijin.
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium ml-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-white bg-white/10"
                    : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:block w-52 lg:w-64">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d6169] pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
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

          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Search"
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          {/* Right icon group */}
          <div className="flex items-center gap-1">
            {/* Random anime */}
            <button
              onClick={handleRandom}
              disabled={randomLoading}
              aria-label="Random anime"
              title="Random Anime"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-60"
            >
              {randomLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              )}
            </button>

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifsOpen((v) => !v)}
                aria-label="Notifications"
                className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                  notifsOpen ? "text-white bg-white/10" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 border-2 border-[#0a0a0f]" />
              </button>
              <NotificationPanel open={notifsOpen} onClose={() => setNotifsOpen(false)} />
            </div>

            {/* Account */}
            <button
              onClick={() => setAuthOpen(true)}
              aria-label="Account"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-[#1e1e28] px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d6169] pointer-events-none"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime..."
                  autoFocus
                  className="w-full bg-[#111118] text-sm text-white placeholder-[#5d6169] rounded-full pl-9 pr-4 py-2.5 outline-none border border-[#1e1e28] focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-colors"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile nav menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e1e28] py-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-5 py-3 text-sm font-medium transition-colors ${
                  isActive(link.to) ? "text-white bg-white/5" : "text-[#bfc1c6] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
