# AGENTS.md

USE DAISYUI https://daisyui.com/components 

## Project Snapshot

- `qwik-moviestracker` is a private Qwik City app for browsing movies and TV,
  showing media details, authenticating with Google, reading curated data from
  MongoDB Atlas, and interacting with a TorrServer instance.
- The practical production path today is Bun SSR packaged in Docker and
  deployed with Google Cloud Build / Cloud Run.
- The source of truth is `src/`, `public/`, and root config files. Generated
  build output is also committed, but agents should treat it as derived.

## Start Here

Before making changes, read these files in roughly this order:

1. `package.json`
2. `vite.config.ts`
3. `src/root.tsx`
4. `src/routes/plugin@auth.ts`
5. `src/routes/(auth-guard)/layout.tsx`
6. The relevant service module under `src/services/`

## Source Of Truth

- Edit `src/**`, `public/**`, and root config files.
- Do not hand-edit `dist/**` or `server/**` unless the user explicitly asks for
  generated output changes.
- Treat `server/**` as generated SSR output.
- Treat `adapters/cloud-run/vite.config.ts` carefully: it references
  `src/entry.cloud-run.tsx`, which does not currently exist.

## Core Commands

Prefer Bun because the repo is Bun-oriented and includes `bun.lockb`.

- Install deps: `bun install`
- Dev server: `bun start`
- Lint: `bun run lint`
- Type-check: `bun run build.types`
- Full build: `bun run build`
- Preview built app: `bun preview`
- Serve Bun SSR output: `bun run serve`
- Optional formatting: `bun run fmt` or `bun run biome`

## Architecture Map

### App shell

- Root document and app shell live in `src/root.tsx`.
- Qwik City routing is file-based under `src/routes/`.
- Global cache headers are set in `src/routes/layout.tsx`.

### Auth

- Auth is configured in `src/routes/plugin@auth.ts`.
- Google is the active provider.
- Sessions use MongoDB-backed storage when `MONGO_URI` is available.
- In build / SSG contexts without Mongo, auth falls back to JWT session config.
- Protected routes are grouped under `src/routes/(auth-guard)/`.
- Redirect enforcement happens in `src/routes/(auth-guard)/layout.tsx`.

### Data and integrations

- TMDB API client: `src/services/tmdb.ts`
- Google Cloud gateway API client for IMDb and torrent lookup:
  `src/services/cloud-func-api.ts`
- MongoDB Atlas reads for latest torrent-backed movies:
  `src/services/mongoatlas.ts`
- TorrServer API client: `src/services/torrserver.ts`
- Mongo client reuse and pooling: `src/utils/mongodbinit.ts`

### Route layout

- `/auth` is the public login experience.
- `/` inside `(auth-guard)` is the signed-in dashboard.
- Auth-guarded route families:
  - `movie`
  - `tv`
  - `person`
  - `search`
  - `torrserver`

## Important Working Rules

### 1. Preserve the auth boundary

- New authenticated pages belong under `src/routes/(auth-guard)/` unless there
  is a clear reason not to.
- Auth logic should stay centralized in `plugin@auth.ts` and the auth-guard
  layout instead of being duplicated in page components.

### 2. Preserve the language flow

- The app reads language from the `lang` query param using
  `src/shared/loaders.ts`.
- If you add links or navigational flows, preserve `lang` unless the task says
  otherwise.

### 3. Keep integration logic in services

- Fetching TMDB, MongoDB, Cloud gateway, or TorrServer data should live in
  `src/services/**`.
- Page components should compose data, not define duplicated network clients.

### 4. Respect server/runtime boundaries

- Some code reads env through `event.env.get(...)` or `env.get(...)`.
- Some service code reads `process.env.*`.
- Do not move server-only env access into browser-only code.

### 5. Avoid noisy repo churn

- This repo has ESLint, Prettier, and Biome configured.
- Do not reformat unrelated files as part of a focused change.
- Keep diffs targeted and avoid touching generated output unless required.

## Environment And Secrets

Expected environment variables include:

- `GOOGLE_ID`
- `GOOGLE_SECRET`
- `AUTH_SECRET`
- `MONGO_URI`
- `TMDB_API_KEY`
- `GC_API_KEY`
- `VITE_FIREBASE_CONFIG`

Agent rules for secrets:

- Never print secret values back to the user.
- Never paste `.env` contents into summaries, commits, issues, or docs.
- If debugging env-related issues, name the missing variable without echoing its
  value.

## Deployment Notes

- Bun SSR entry point: `src/entry.bun.ts`
- Docker build and runtime path: `Dockerfile`
- Cloud Build / Cloud Run deployment path: `cloudbuild.yaml`
- The current practical deploy shape is Docker -> Bun SSR output, not the stale
  Cloud Run adapter config.

## Verification Expectations

There is no established automated test suite in this repo right now.

All agents, including subagents, must validate their changes before reporting
completion.

Minimum verification for most code changes:

1. `bun run build.types`
2. `bun run lint`

Add `bun run build` when the change touches:

- routing
- SSR/runtime behavior
- deployment config
- auth
- environment usage

Subagent verification rules:

- A subagent that changes code must run the relevant verification commands for
  the files or flows it touched before handing work back.
- The coordinating/final agent must rerun the appropriate project-level
  verification after integrating all subagent changes and before declaring the
  task done.
- Do not claim the project is working after changes unless verification was run
  successfully, or you explicitly state the blocker that prevented validation.

## Known Sharp Edges

- `dist/` and `server/` are committed generated output.
- There is no in-repo test harness yet.
- `adapters/cloud-run/vite.config.ts` points to a missing entry file.
- There is a likely dead typo file at `src/utils/fomat.ts`; verify usage before
  removing it.
- The repo contains sensitive local env material; handle it as confidential.

## Task Routing Cheatsheet

- Auth bug or provider change:
  `src/routes/plugin@auth.ts`
- Login page or public landing changes:
  `src/routes/auth/index.tsx`
- Toolbar or signed-in shell changes:
  `src/routes/(auth-guard)/layout.tsx`,
  `src/components/toolbar/**`
- Home dashboard / trending sections:
  `src/routes/(auth-guard)/index.tsx`
- Media detail pages:
  `src/routes/(auth-guard)/movie/[id]/index.tsx`,
  `src/routes/(auth-guard)/tv/[id]/index.tsx`,
  `src/components/media-details/**`
- Search behavior:
  `src/routes/(auth-guard)/search/index.tsx`,
  `src/services/tmdb.ts`
- TorrServer flows:
  `src/routes/(auth-guard)/torrserver/index.tsx`,
  `src/services/torrserver.ts`
- Latest Mongo-backed content:
  `src/services/mongoatlas.ts`
- Deployment/runtime:
  `src/entry.bun.ts`, `Dockerfile`, `cloudbuild.yaml`, `adapters/**`

## Good Agent Outcome

A good change in this repo is:

- scoped to the real source files
- aware of auth and `lang` propagation
- verified by the agent that made it, and revalidated after integrated changes
- careful with secrets
- explicit about deployment/runtime implications
