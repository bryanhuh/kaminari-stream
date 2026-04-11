# raijin. — Feature TODO

## High Priority

- [x] **Watchlist / Favorites** — Let users bookmark anime to watch later. Needs a new SQLite table, API routes (add/remove/list), and UI (heart/bookmark button on AnimeCard, AnimeDetail, and a `/watchlist` page).
- [x] **Watch History page** — Dedicated `/history` page listing all watched episodes with progress, grouped by anime. Data already exists in SQLite — just needs a page + route.
- [x] **404 page** — Fallback route in the router for unmatched URLs.
- [x] **Search filters** — Genre, format (TV/Movie/OVA), year, and status filters on the `/search` page.

## Medium Priority

- [x] **Resume watching on AnimeDetail** — If the user has watch history for an anime, show "Resume Episode X" CTA instead of (or alongside) "Watch Now".
- [x] **Remove from watch history** — Allow users to delete individual entries from their history (button on history page and/or continue watching banner).
- [x] **Mobile bottom navigation bar** — Persistent bottom nav on mobile with Home, Browse, Search, History shortcuts.
- [x] **Dynamic page titles & meta** — Set `<title>` and `<meta name="description">` per page (anime name on detail/watch pages, search query on search page, etc.).
- [x] **Loading states / Suspense boundaries** — Add top-level loading indicators and `Suspense` boundaries for route transitions and async data fetching.
- [x] **Accessibility improvements** — Add skip-to-content link, focus management on route changes, and ARIA labels across interactive elements.
- [x] **SEO / Open Graph tags** — Add `<meta description>`, Open Graph, and Twitter Card tags per page (use `react-helmet` or equivalent).

## Lower Priority / Nice to Have

- [x] **Auth backend** — Wire up the sign in / sign up modal to a real user system (JWT, sessions, or similar). Currently the AuthModal is UI-only.
- [ ] **Comments persistence** — Move comments from localStorage to the SQLite backend so they persist across browsers/devices.
- [ ] **PWA manifest** — Add `manifest.json` and service worker so the app is installable to home screen on mobile.
- [ ] **Ratings / reviews** — Allow logged-in users to rate anime (1–10 stars) and leave a short review on the anime detail page.
- [ ] **Episode progress bars on EpisodeList** — Show a thin progress bar on partially-watched episode cards (data already available from watch history).
- [ ] **Error tracking / monitoring** — Integrate Sentry or similar service so runtime errors are captured beyond `console.error` in ErrorBoundary.
- [ ] **Analytics** — Basic page-view / event tracking to understand usage patterns.

## Done ✅

- [x] Hero spotlight carousel
- [x] Recent episodes strip
- [x] This season section
- [x] Trending / popular grids
- [x] Weekly schedule
- [x] Browse (genres, types, A–Z, ongoing, recent)
- [x] Shows & Movies pages with genre filter
- [x] Search with debounce
- [x] Anime detail page (banner, cover, stats, synopsis, trailer, episodes, characters, relations, recommendations)
- [x] Watch page (player, episode sidebar, mobile strip, server switching, auto-next, keyboard shortcuts)
- [x] Subtitle support (VTT proxied through HLS proxy)
- [x] Watch history (SQLite, continue watching banner)
- [x] Comments (per episode, localStorage)
- [x] Notification panel with discover section
- [x] Rate limit toast (429 handling)
- [x] AnimeDetail banner hover play button
- [x] Plus Jakarta Sans font
- [x] Raijin gold theme
- [x] Footer with mascot
- [x] GitHub star banner
