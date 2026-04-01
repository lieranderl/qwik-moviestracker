# Architecture

## Snapshot

- Framework: Qwik / Qwik City 1.x
- Runtime path: Bun SSR
- Tooling baseline: Bun + Vite 7 + Biome 2
- Deploy path: Docker -> Cloud Build -> Cloud Run
- Styling stack: Tailwind CSS v4 + daisyUI 5 + Catppuccin themes

## Entry Points

- App shell: `src/root.tsx`
- Vite config: `vite.config.ts`
- Bun SSR entry: `src/entry.bun.ts`
- Preview SSR entry: `src/entry.preview.tsx`
- Auth plugin: `src/routes/plugin@auth.ts`
- Protected shell: `src/routes/(auth-guard)/layout.tsx`

## Route Structure

- Public auth page: `src/routes/auth/index.tsx`
- Protected routes live under `src/routes/(auth-guard)/`
- Main protected families:
  - `movie`
  - `tv`
  - `person`
  - `search`
  - `torrserver`
- Discovery landing pages under `movie/` and `tv/` blend TMDB shelves with the
  existing localized routing pattern (`?lang=...`).
- Movie category routes mix TMDB discovery shelves (`trending`, `popular`,
  `nowplaying`, `upcoming`) with Mongo-backed local collections
  (`updated`, `hdr10`, `dolbyvision`).
- TV category routes are TMDB-backed discovery shelves (`trending`,
  `popular`, `toprated`, `airingtoday`, `ontheair`) and should reject unknown
  slugs instead of falling back to unrelated content.

## Auth Model

- Auth is configured centrally in `src/routes/plugin@auth.ts`.
- Google is the active provider.
- MongoDB-backed sessions are used when `MONGO_URI` is available.
- Build and test contexts may fall back to JWT sessions when Mongo is absent.
- Normal runtime auth must use a real `AUTH_SECRET`; the build-safe placeholder
  secret is not a valid deployed runtime configuration.
- Redirect enforcement belongs in `src/routes/(auth-guard)/layout.tsx`.
- Unauthenticated redirects from the auth guard must preserve the current
  `lang` query parameter when it is present.

## Service Boundaries

- TMDB client: `src/services/tmdb.ts`
- Cloud gateway client: `src/services/cloud-func-api.ts`
- MongoDB Atlas reads: `src/services/mongoatlas.ts`
- TorrServer client: `src/services/torrserver.ts`
- Mongo client init and reuse: `src/utils/mongodbinit.ts`

Keep new external API access in `src/services/**`, not inside route files.

## Runtime Boundaries

- Some server code reads env through `event.env.get(...)`.
- Some service code reads `process.env.*`.
- Do not move server-only env access into browser-only code.
- Do not serialize secret env values through route loader return values.
- Mongo-backed pages should read `MONGO_URI` on the server boundary and return
  fetched data, not the connection string itself.
- Protected movie, TV, and person detail routes should fetch TMDB and IMDb data
  inside `routeLoader$` and pass plain data into presentational components.
- Movie and TV detail loaders now normalize TMDB region-specific certifications
  and watch-provider availability before rendering the detail UI.

## Generated Output

- `dist/**` is build output.
- `server/**` is generated SSR output.
- Treat both as derived artifacts.

## Deployment Files

- Docker runtime: `Dockerfile`
- Cloud Build pipeline: `cloudbuild.yaml`
- Local deploy helper: `gcloud_deploy.sh`

## Known Gaps

- `adapters/cloud-run/vite.config.ts` references a missing
  `src/entry.cloud-run.tsx`.
- The in-repo test surface is still small, but Bun-based route and logic tests
  now exist under `src/routes/**`.
