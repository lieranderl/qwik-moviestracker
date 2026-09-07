# Architecture

## Snapshot

- Framework: Qwik / Qwik City 1.x
- Runtime path: Bun SSR
- Tooling baseline: Bun + Vite 7 + ESLint + Prettier
- Deploy path: Docker -> GitHub Actions -> Artifact Registry -> Cloud Run
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
- The TorrServer route now behaves as an operational streaming workspace rather
  than a simple connection form: the page keeps local endpoint selection,
  server snapshot data, torrent filtering, file-level playback actions, and the
  embedded browser player coordinated from
  `src/routes/(auth-guard)/torrserver/index.tsx` with presentational helpers in
  `src/components/torrserver/**`.
- The workspace now also exposes API tooling for `/search`,
  `/torznab/search`, `/torrent/upload`, `/storage/settings` update, `/viewed`
  set/remove, `/download/{size}`, `/cache`, and `/ffp/{hash}/{id}`.
- Browser playback now primes each selected file with `/play/{hash}/{id}`
  before opening `/stream` so TorrServer starts torrent reading first.
- Discovery landing pages under `movie/` and `tv/` blend TMDB shelves with the
  existing localized routing pattern (`?lang=...`).
- Dedicated TMDB discover routes now live at `movie/discover/` and
  `tv/discover/`. They use GET query params so filters, pagination, and `lang`
  stay in the URL.
- Movie category routes mix TMDB discovery shelves (`trending`, `popular`,
  `nowplaying`, `upcoming`) with Firestore-backed local collections
  (`updated`, `hdr10`, `dolbyvision`).
- TV category routes are TMDB-backed discovery shelves (`trending`,
  `popular`, `toprated`, `airingtoday`, `ontheair`) and should reject unknown
  slugs instead of falling back to unrelated content.

## Auth Model

- Auth is configured centrally in `src/routes/plugin@auth.ts`.
- Google is the active provider.
- Auth.js always uses signed JWT sessions.
- Build and test contexts may use a non-runtime placeholder JWT secret.
- Normal runtime auth must use a real `AUTH_SECRET`; the build-safe placeholder
  secret is not a valid deployed runtime configuration.
- Redirect enforcement belongs in `src/routes/(auth-guard)/layout.tsx`.
- Unauthenticated redirects from the auth guard must preserve the current
  `lang` query parameter when it is present.

## Service Boundaries

- TMDB client: `src/services/tmdb.ts`
- Private IMDb Cloud Run client with temporary gateway fallback:
  `src/services/cloud-func-api.ts`
- JacRed torrent-search adapter: `src/services/torrent-search.ts`
- Firestore Native reads: `src/services/firestore.ts`
- TorrServer client: `src/services/torrserver.ts`
- Discover filter normalization and TMDB catalog option helpers live in
  `src/utils/discover.ts`.

Keep new external API access in `src/services/**`, not inside route files.

## Runtime Boundaries

- Some server code reads env through `event.env.get(...)`.
- Some service code reads `process.env.*`.
- Do not move server-only env access into browser-only code.
- Do not serialize secret env values through route loader return values.
- Firestore-backed pages use ADC on the server boundary and return fetched data
  plus opaque pagination cursors, never credentials.
- Protected detail routes fetch their primary TMDB data in `routeLoader$`.
  Movie IMDb enrichment starts from a browser-visible resource after primary
  content renders, so an IMDb cold start never blocks SSR or the detail page.
- Movie and TV detail loaders now normalize TMDB region-specific certifications
  and watch-provider availability before rendering the detail UI.
- Movie `nowplaying` and `upcoming` shelves now pass the region derived from
  the active `lang` into TMDB so release-driven results better match the
  localized browsing context.
- Movie and TV discover loaders fetch TMDB certification and provider catalogs
  on the server, validate query-param filters against those catalogs, and only
  then call the discover endpoints.

## Generated Output

- `dist/**` is build output.
- `server/**` is generated SSR output.
- Treat both as derived, ignored artifacts; never commit them.

## Deployment Files

- Docker runtime: `Dockerfile`
- Quality workflow: `.github/workflows/quality.yml`
- Production deployment workflow: `.github/workflows/deploy.yml`
- Deployment smoke check: `scripts/smoke-deployment.sh`
- Local operational tasks: `Makefile`
- Environment template: `.env.example`

The repository supports development and production only. Production deploys are
triggered by published GitHub releases, authenticate to GCP through GitHub OIDC
/ Workload Identity Federation, build, scan locally, push the clean image to
Artifact Registry, deploy a no-traffic Cloud Run candidate, smoke-test its
health endpoint, route 100% traffic to it, smoke-test via the production URL,
and roll back on failure. OpenTofu owns service configuration, environment and
secret bindings, IAM, and alerting; releases change only image and traffic.

## Known Gaps

- The in-repo test surface is still small, but Bun-based route and logic tests
  now exist under `src/routes/**`.
