# Guardrails

## Source Of Truth

- Edit `src/**`, `public/**`, and root config files.
- Do not hand-edit `dist/**` or `server/**` unless explicitly requested.

## Auth Boundary

- New authenticated pages belong under `src/routes/(auth-guard)/`.
- Keep auth logic centralized in `src/routes/plugin@auth.ts` and the
  auth-guard layout.
- Do not duplicate auth gating inside individual page components unless there is
  a strong reason.

## Language Flow

- The app reads language from the `lang` query parameter.
- Preserve `lang` across new links and navigational flows unless the task
  intentionally changes language behavior.

## Service Layer

- TMDB, MongoDB, Cloud gateway, and TorrServer access belongs in
  `src/services/**`.
- Route files should compose data, not create duplicate clients.

## Commercial Boundary

- Do not add subscriptions, ads, affiliate links, sponsored content, public SEO
  catalog pages, or other revenue flows around TMDB-derived data until the
  project has an explicit commercial TMDB agreement and required attribution.
- Do not monetize torrent, magnet-link, or TorrServer flows. If the app becomes
  public or paid, keep those features private/self-hosted, remove them from the
  commercial surface, or gate them behind a documented legal/compliance decision.
- Prefer legal watch-provider, user-owned library, personalization, deployment,
  and support value propositions over access to copyrighted media files.

## Secrets

- Treat `.env`, `.env.*`, and `adminSDK.json` as sensitive. `.env.example` may
  contain placeholder names only.
- Never print secret values into summaries, issues, or docs.
- Name missing variables without echoing their values.
- Production secrets belong in Google Secret Manager and are injected by Cloud
  Run. GitHub Actions may reference secret names, but must not store secret
  values or service-account keys.
- Claude project hooks block direct edits to `.env*`, `adminSDK.json`,
  `dist/**`, and `server/**`.

## Runtime Safety

- Respect server/browser boundaries for env access.
- Never expose server secrets by returning them from `routeLoader$` values or
  any other state that gets serialized to the client.
- Read request-scoped env inside `routeLoader$`, request handlers, or `server$`
  functions only, and pass derived data rather than raw secret values.
- Be careful with auth fallback behavior during build and SSG.
- `src/routes/plugin@auth.ts` may use a placeholder secret only for build/test
  contexts in the JWT fallback branch where MongoDB is absent.
- Runtime auth must fail closed without a real `AUTH_SECRET`; do not allow a
  predictable placeholder secret in normal dev, preview, or deployed auth
  flows.
- Keep MongoDB and Auth Mongo adapter runtime imports behind request-time
  guards. Bun SSG may run without `MONGO_URI`, and MongoDB 7/BSON imports
  Node APIs that can break Linux container builds if loaded during SSG.
- Keep the MongoDB driver on the Bun-compatible 6.x line until Bun supports the
  `node:v8` startup snapshot APIs used by MongoDB 7/BSON.
- Production auth/origin handling must pin the public origin with `AUTH_URL`;
  add preview/custom hosts with `TRUSTED_ORIGINS` instead of trusting arbitrary
  `Host` or `x-forwarded-proto` headers.
- Do not statically generate auth or other nonce-sensitive HTML routes. CSP
  nonces must be generated per request and match the inline Qwik scripts in the
  served response.
- The Playwright browser suite may use a dev-only session bypass, but it must
  stay behind an explicit server env flag plus a dedicated browser cookie.
  Never enable that bypass by default or in production.
- Deterministic Playwright route fixtures are allowed only behind that same
  explicit bypass gate. Keep them narrow, route-scoped, and obviously fake so
  they never become an alternate production data path.
- Treat deployment config as part of runtime behavior, not standalone docs.
- The supported environment model is development plus production only. Do not
  add extra runtime services, branches, variables, or workflows.
- GitHub Actions is the production delivery path. Do not reintroduce Cloud
  Build, local shell deploy scripts, or console-only release steps as parallel
  production mechanisms.
- Production deploys must use immutable Artifact Registry digests and Cloud Run
  traffic promotion/rollback rather than mutable tags.
- Prefer shared browser helpers in `src/utils/browser.ts` for `localStorage`
  and dialog access instead of repeating raw browser-global checks.
- Do not treat `typeof localStorage !== "undefined"` as sufficient. Validate
  the Storage API shape (`getItem` / `setItem`) or go through the shared helper
  because some runtimes expose a non-Storage placeholder.
- Use `useVisibleTask$` for initial browser-only hydration when route state must
  be restored from `localStorage` after resume or browser restart, such as the
  TorrServer page.
- Recent activity and recent-search storage are resume-sensitive browser state.
  Read and write them from `useVisibleTask$`; the authenticated search/browser
  smoke tests rely on that behavior.
- Reserve raw DOM logic for actual DOM-dependent work such as element refs,
  layout measurement, or event listeners.

## Repo Sharp Edges

- `dist/**` and `server/**` are committed generated output.
- The repo has a small Bun-based test surface, but coverage is still narrow.
- `adapters/cloud-run/vite.config.ts` references a missing entry file.
- Keep Docker's Bun image pinned to the same tested Bun version as CI. Floating
  `oven/bun:1` can pick up Linux runtime regressions before GitHub CI sees
  them.
- Docker runtime must stay non-root and expose port `3000`.
- Verify the usage of suspicious legacy files before deleting them.

## Claude Enforcement

- Project-local Claude hooks track when code files were edited in a session.
- Claude stop is blocked when required verification did not run for tracked
  code changes.
- Docs-only work under `references/**`, `.claude/**`, `plans/**`, `AGENTS.md`,
  and `CLAUDE.md` does not trigger app verification requirements.
