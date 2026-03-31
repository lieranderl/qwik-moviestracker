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

## Secrets

- Treat `.env`, `.env.*`, and `adminSDK.json` as sensitive.
- Never print secret values into summaries, issues, or docs.
- Name missing variables without echoing their values.
- Claude project hooks block direct edits to `.env*`, `adminSDK.json`,
  `dist/**`, and `server/**`.

## Runtime Safety

- Respect server/browser boundaries for env access.
- Never expose server secrets by returning them from `routeLoader$` values or
  any other state that gets serialized to the client.
- Read request-scoped env inside `routeLoader$`, request handlers, or `server$`
  functions only, and pass derived data rather than raw secret values.
- Be careful with auth fallback behavior during build and SSG.
- `src/routes/plugin@auth.ts` may use a placeholder secret only in the
  build-safe fallback branch where MongoDB is absent, so CI and SSG can build
  without production auth env. The normal runtime auth path must still rely on
  a real `AUTH_SECRET`.
- Treat deployment config as part of runtime behavior, not standalone docs.
- Prefer shared browser helpers in `src/utils/browser.ts` for `localStorage`
  and dialog access instead of repeating raw browser-global checks.
- Do not treat `typeof localStorage !== "undefined"` as sufficient. Validate
  the Storage API shape (`getItem` / `setItem`) or go through the shared helper
  because some runtimes expose a non-Storage placeholder.
- Prefer `useTask$` with an `isServer` guard for ongoing storage sync.
- Use `useVisibleTask$` for initial browser-only hydration when route state must
  be restored from `localStorage` after resume or browser restart, such as the
  TorrServer page.
- Recent activity and recent-search storage are also resume-sensitive browser
  state. Read and write them from `useVisibleTask$`, not a no-track `useTask$`
  with an `isServer` early return.
- Reserve raw DOM logic for actual DOM-dependent work such as element refs,
  layout measurement, or event listeners.

## Repo Sharp Edges

- `dist/**` and `server/**` are committed generated output.
- The repo has a small Bun-based test surface, but coverage is still narrow.
- `adapters/cloud-run/vite.config.ts` references a missing entry file.
- Verify the usage of suspicious legacy files before deleting them.

## Claude Enforcement

- Project-local Claude hooks track when code files were edited in a session.
- Claude stop is blocked when required verification did not run for tracked
  code changes.
- Docs-only work under `references/**`, `.claude/**`, `plans/**`, `AGENTS.md`,
  and `CLAUDE.md` does not trigger app verification requirements.
