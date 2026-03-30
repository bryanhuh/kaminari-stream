# Anime App

A personal anime streaming app built as a portfolio project.

- **Browse & search** anime via the [AniList GraphQL API](https://anilist.co)
- **Stream episodes** via a self-hosted [Consumet API](https://github.com/consumet/api.consumet.org) instance (Gogoanime provider)
- **Watch history** with per-episode progress tracking and a "Continue Watching" row

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4, urql, React Query, vidstack |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3 + drizzle-orm) |
| Monorepo | pnpm workspaces + Turborepo |

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 — `npm install -g pnpm`
- **Docker** (for the Consumet streaming API)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Consumet (streaming source)

```bash
docker compose -f docker/consumet/docker-compose.yml up -d
```

Consumet will be available at `http://localhost:3001`.

### 3. Start the dev servers

```bash
pnpm dev
```

This runs the API (`localhost:4000`) and the web app (`localhost:5173`) in parallel via Turborepo.

## Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across all source files |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm format` | Format with Prettier |
| `pnpm typecheck` | TypeScript type-check all packages |

## Project structure

```
anime-app/
├── apps/
│   ├── api/          # Express backend (port 4000)
│   └── web/          # React frontend (port 5173)
├── packages/
│   └── types/        # Shared TypeScript types
└── docker/
    └── consumet/     # docker-compose for the streaming provider
```

## How streaming works

1. The frontend fetches anime metadata (title, episodes list, etc.) directly from AniList.
2. When a user opens an episode, the API resolves the AniList ID to a Gogoanime slug (cached in SQLite).
3. The API proxies an episode stream request to the local Consumet instance, which returns HLS source URLs.
4. vidstack plays the HLS stream in the browser.

## Notes

- This app is for **personal use only** and is not intended for commercial deployment.
- The Consumet instance must be running locally for streaming to work.
- AniList → Gogoanime ID mapping relies on title search and may occasionally misfire for series with unusual titles. Add entries to the `OVERRIDES` map in `apps/api/src/services/providerResolver.ts` to fix specific cases.
