import { useState } from "react";

const DISMISSED_KEY = "githubStarDismissed";

export default function GitHubStarBanner() {
  const [dismissed, setDismissed] = useState<boolean>(
    () => localStorage.getItem(DISMISSED_KEY) === "true"
  );

  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="relative bg-gradient-to-r from-[#111118] to-[#1a1a24] border border-primary-500/20 rounded-2xl overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-[#5d6169] hover:text-white hover:bg-white/10 transition-colors z-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-end gap-4 pr-10">
        {/* Mascot peeking from left/bottom */}
        <div className="shrink-0 self-end">
          <img
            src="/mascot-star.png"
            alt="Mascot"
            className="h-28 w-auto object-contain"
            style={{ marginBottom: "-1px" }}
          />
        </div>

        {/* Center text */}
        <div className="flex-1 py-5 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight">
            Enjoying the app?
          </h3>
          <p className="text-[#8e9099] text-sm mt-1 leading-relaxed max-w-md">
            If you love what you're watching, show some love by starring the repo on GitHub! It really helps.
          </p>
        </div>

        {/* Star button */}
        <div className="shrink-0 py-5 pr-2">
          <a
            href="https://github.com/bryandiolataa/anime-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary-500/20 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Star on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
