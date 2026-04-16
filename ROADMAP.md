# raijin. — Roadmap

Items are roughly ordered by impact vs. effort. Each section is independent — they can be picked up in any order.

---

## High Impact

- [x] **Persist AniList cache to DB** — The server-side AniList cache is an in-memory `Map` that dies on every restart (including dev HMR). Swap it for a DB-backed cache with a TTL column so responses survive restarts and 429s stop happening in normal usage.

- [x] **Hover prefetch on AnimeCards** — On `mouseenter` (after ~150ms debounce), call `queryClient.prefetchQuery` for `GET /api/anime/:id`. By the time the user clicks through, the detail data is already in cache and the page renders instantly.

- [x] **Anime status tracking** — Add MAL-style per-anime status: Watching / Completed / Dropped / Plan to Watch. Needs a new SQLite table, API routes, and a status selector UI on AnimeDetail. More useful than a plain watchlist for people who actually track what they watch.

---

## Medium Impact

- [x] **Virtual scrolling on EpisodeList** — Long series (One Piece, Naruto, Bleach) render 500–1000+ episode cards into the DOM at once. Swap for TanStack Virtual so only ~20 are mounted at any time.

- [x] **Infinite scroll on Search / Browse** — Replace pagination buttons with an `IntersectionObserver`-driven load-more. The hooks already support a `page` param — it's mostly a UI change.

- [x] **Export watch history / watchlist** — A single API endpoint (`GET /api/history/export`, `GET /api/watchlist/export`) returning CSV or JSON. Lets users back up data or migrate to MAL/AniList.

- [x] **Multi-language title support** — English / Romaji / Japanese title preference stored in localStorage. Picker lives on the Profile page under Preferences; all anime cards and detail pages respect it.

- [x] **Watch party / share links** — "Share" button in the watch page controls copies a URL with the current timestamp (`?t=seconds`). Opening the link seeks directly to that position.

- [x] **User stats activity chart** — Weekly episode count bar chart (past 8 weeks) on the Profile page using Recharts. Backed by `GET /api/auth/history-chart`.

- [x] **Anime comparison** — `/compare` page with searchable pickers for two anime and a side-by-side stats view (score, format, episodes, genres, synopsis, etc.). Linked from the Navbar.

---

## Lower Priority / Polish

- [x] **Keyboard shortcuts help modal** — `?` key opens a modal listing all player and global shortcuts. The shortcuts exist but there's no way to discover them.

- [x] **Random anime button** — Surface the existing `GET /api/anime/random` endpoint in the Navbar or Browse page. One button, zero backend work.

- [x] **AniList OAuth login** — Let users connect their AniList account to sync watch status bidirectionally. More involved but makes the app a real AniList companion.
