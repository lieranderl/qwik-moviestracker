---
description: >-
  Architecture map for qwik-moviestracker including route groups, service
  modules, and the main files to inspect for each task area.
metadata:
  tags: [architecture, routes, services, qwik, auth, tmdb, torrserver]
  source: project
---

# Architecture

## Runtime Shape

- Framework: Qwik + Qwik City
- Main runtime target: Bun SSR
- Deployment shape in practice: Docker image deployed via Google Cloud Build to
  Cloud Run

## Key Entry Points

| Area | File |
|------|------|
| Root app shell | `src/root.tsx` |
| Base Vite config | `vite.config.ts` |
| Bun SSR entry | `src/entry.bun.ts` |
| Auth plugin | `src/routes/plugin@auth.ts` |
| Shared query/env loaders | `src/shared/loaders.ts` |

## Route Structure

### Public

- `src/routes/auth/index.tsx` - login / landing page
- `src/routes/layout.tsx` - global layout and cache headers

### Authenticated

Protected routes live under `src/routes/(auth-guard)/`.

| Feature | Files |
|---------|-------|
| Signed-in shell | `src/routes/(auth-guard)/layout.tsx` |
| Home dashboard | `src/routes/(auth-guard)/index.tsx` |
| Movie lists/details | `src/routes/(auth-guard)/movie/**` |
| TV lists/details | `src/routes/(auth-guard)/tv/**` |
| Person details | `src/routes/(auth-guard)/person/**` |
| Search | `src/routes/(auth-guard)/search/index.tsx` |
| TorrServer management | `src/routes/(auth-guard)/torrserver/index.tsx` |

## Service Layer

| Concern | File | Notes |
|---------|------|-------|
| TMDB client | `src/services/tmdb.ts` | Trending, search, detail fetches, images |
| Google Cloud gateway | `src/services/cloud-func-api.ts` | IMDb ratings and torrent search |
| Mongo latest content | `src/services/mongoatlas.ts` | Reads curated/latest movie data |
| TorrServer API | `src/services/torrserver.ts` | Echo, list, add, remove |
| Mongo client reuse | `src/utils/mongodbinit.ts` | Global cached client, bounded pool |

## UI Component Areas

| Area | Directory |
|------|-----------|
| Media details | `src/components/media-details/` |
| Person details | `src/components/person-details/` |
| Toolbar and nav | `src/components/toolbar/` |
| Shared cards / grids / modals | `src/components/` |

## Behavior Notes

- Language is derived from the `lang` query parameter through
  `src/shared/loaders.ts`.
- Auth redirect enforcement happens in the `(auth-guard)` layout, not each page.
- External API logic is already centralized in services; keep it there.
- Mongo-backed auth switches to a JWT fallback when `MONGO_URI` is absent at
  build time.
