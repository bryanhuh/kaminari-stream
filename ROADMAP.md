# raijin. — Roadmap

Items are roughly ordered by impact vs. effort. Each section is independent — they can be picked up in any order.

---

## High Impact

- [ ] **Persist AniList cache to SQLite** — The server-side AniList cache is an in-memory `Map` that dies on every restart (including dev HMR). Swap it for a SQLite-backed cache with a TTL column so responses survive restarts and 429s stop happening in normal usage.

- [ ] **Hover prefetch on AnimeCards** — On `mouseenter` (after ~150ms debounce), call `queryClient.prefetchQuery` for `GET /api/anime/:id`. By the time the user clicks through, the detail data is already in cache and the page renders instantly.

- [ ] **Anime status tracking** — Add MAL-style per-anime status: Watching / Completed / Dropped / Plan to Watch. Needs a new SQLite table, API routes, and a status selector UI on AnimeDetail. More useful than a plain watchlist for people who actually track what they watch.

---

## Medium Impact

- [ ] **Virtual scrolling on EpisodeList** — Long series (One Piece, Naruto, Bleach) render 500–1000+ episode cards into the DOM at once. Swap for TanStack Virtual so only ~20 are mounted at any time.

- [ ] **Infinite scroll on Search / Browse** — Replace pagination buttons with an `IntersectionObserver`-driven load-more. The hooks already support a `page` param — it's mostly a UI change.

- [ ] **Export watch history / watchlist** — A single API endpoint (`GET /api/history/export`, `GET /api/watchlist/export`) returning CSV or JSON. Lets users back up data or migrate to MAL/AniList.

---

## Lower Priority / Polish

- [ ] **Keyboard shortcuts help modal** — `?` key opens a modal listing all player and global shortcuts. The shortcuts exist but there's no way to discover them.

- [ ] **Random anime button** — Surface the existing `GET /api/anime/random` endpoint in the Navbar or Browse page. One button, zero backend work.

- [ ] **AniList OAuth login** — Let users connect their AniList account to sync watch status bidirectionally. More involved but makes the app a real AniList companion.
