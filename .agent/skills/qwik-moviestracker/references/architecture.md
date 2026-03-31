---
description: >-
  Current architecture map for qwik-moviestracker covering runtime shape,
  route families, service boundaries, shared UI primitives, and the main files
  to inspect for each feature area.
metadata:
  tags: [architecture, routes, services, ui, qwik, auth, tmdb, torrserver]
  source: project
---

# Architecture

## Runtime Shape

- Framework: Qwik + Qwik City
- Main runtime target: Bun SSR
- Practical deployment path: Docker image built from `Dockerfile` and deployed
  with `cloudbuild.yaml`
- Route structure is file-based under `src/routes/`

## Key Entry Points

| Area | File |
|------|------|
| Root app shell | `src/root.tsx` |
| Base Vite config | `vite.config.ts` |
| Bun SSR entry | `src/entry.bun.ts` |
| Auth plugin | `src/routes/plugin@auth.ts` |
| Auth-guard query/env loaders | `src/routes/(auth-guard)/layout.tsx` |

## Route Families

### Public

- `src/routes/layout.tsx` - global layout and cache headers
- `src/routes/auth/index.tsx` - login / public landing page

### Authenticated

Protected routes live under `src/routes/(auth-guard)/`.

| Feature | Files | Notes |
|---------|-------|-------|
| Signed-in shell | `src/routes/(auth-guard)/layout.tsx` | owns the toolbar and main content container |
| Home dashboard | `src/routes/(auth-guard)/index.tsx` | composed from discovery widgets and carousels |
| Movie discovery/details | `src/routes/(auth-guard)/movie/**` | list, category, detail |
| TV discovery/details | `src/routes/(auth-guard)/tv/**` | list, category, detail |
| Person details | `src/routes/(auth-guard)/person/**` | filmography and profile |
| Search | `src/routes/(auth-guard)/search/index.tsx` | GET-based search form + server search request |
| TorrServer | `src/routes/(auth-guard)/torrserver/index.tsx` | local saved endpoints + live library sync |

## Service Layer

| Concern | File | Notes |
|---------|------|-------|
| TMDB client | `src/services/tmdb.ts` | trending, search, details, recommendations, images |
| Google Cloud gateway | `src/services/cloud-func-api.ts` | IMDb ratings and torrent lookups |
| Mongo latest content | `src/services/mongoatlas.ts` | curated/latest movie data |
| TorrServer API | `src/services/torrserver.ts` | echo, list, add, remove with timeout handling |
| Mongo client reuse | `src/utils/mongodbinit.ts` | global cached client |

## Shared UI Primitives

These are the main building blocks agents should reuse before inventing new
patterns.

| Concern | File / Area |
|---------|-------------|
| Shared loading/error/empty/heading states | `src/components/page-feedback.tsx` |
| Detail-page shell and container | `src/components/detail-page-layout.tsx` |
| Media cards / grid / carousel | `src/components/media-card.tsx`, `src/components/media-grid.tsx`, `src/components/media-carousel.tsx` |
| Toolbar and navigation | `src/components/toolbar/**` |
| Discovery widgets | `src/components/discovery/**` |
| Media detail sections | `src/components/media-details/**` |
| Person detail sections | `src/components/person-details/**` |

## Behavior Notes

- Language is derived from the `lang` query parameter through the
  `(auth-guard)` layout loaders in `src/routes/(auth-guard)/layout.tsx`.
- Auth redirect enforcement happens in the `(auth-guard)` layout, not each page.
- External API logic is already centralized in services; keep it there.
- Mongo-backed auth switches to a JWT fallback when `MONGO_URI` is absent at
  build time.
- Search behavior is split between:
  - `src/routes/(auth-guard)/search/index.tsx`
  - `src/routes/(auth-guard)/search/search.logic.ts`
  - tests in `src/routes/(auth-guard)/search/*.test.ts`
- Home/dashboard composition increasingly relies on discovery-focused components
  instead of page-local markup.
- Detail-page backdrop framing has been extracted into a shared layout
  primitive, so future detail work should prefer that shell.
