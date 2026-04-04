import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="mt-auto">
      <footer className="w-full border-t border-[#1e1e28] bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex flex-col gap-1.5">
              <Link to="/" className="font-extrabold text-xl text-primary-500 tracking-tight">
                raijin.
              </Link>
              <p className="text-xs text-[#5d6169] max-w-sm leading-relaxed">
                A hobby project for anime fans. Built with love and caffeine.
              </p>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-6 text-sm text-[#5d6169]">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
              <Link to="/browse?category=schedule" className="hover:text-white transition-colors">Schedule</Link>
              <Link to="/browse?category=az" className="hover:text-white transition-colors">A–Z</Link>
            </nav>
          </div>

          {/* Divider with mascot sitting on it */}
          <div className="relative">
            <div className="border-t border-[#1e1e28]" />
            <div className="absolute -top-[100px] right-0 pointer-events-none select-none hidden sm:block">
              <img
                src="/mascot.png"
                alt="raijin. mascot"
                className="h-[148px] w-auto drop-shadow-[0_0_24px_rgba(255,213,97,0.25)]"
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex flex-col gap-2 pr-0 sm:pr-40">
            <p className="text-xs text-[#5d6169] leading-relaxed">
              <span className="text-[#bfc1c6] font-medium">Disclaimer:</span>{" "}
              All content available on this site is provided by non-affiliated third parties.
              raijin. does not host, upload, or own any of the video files or media displayed here.
              All trademarks, service marks, trade names, and other intellectual property rights belong
              to their respective owners.
            </p>
            <p className="text-xs text-[#5d6169] leading-relaxed">
              <span className="text-[#bfc1c6] font-medium">DMCA / Takedown Requests:</span>{" "}
              This is a non-commercial hobby project. If you are a rights holder and believe your content
              is being used without authorization, please contact us and we will address your request promptly.
              We respect intellectual property rights and will take down any infringing content upon verified request.
            </p>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-[#1e1e28]">
            <p className="text-xs text-[#5d6169]">
              © {new Date().getFullYear()} raijin. — For educational &amp; hobby use only.
            </p>
            <p className="text-xs text-[#5d6169]">
              Data provided by{" "}
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                AniList
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
