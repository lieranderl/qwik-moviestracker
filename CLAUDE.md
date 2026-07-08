# Project Memory

This file provides project memory for AI coding agents in this repository.
Read `AGENTS.md` first for the root operating contract.

## Project Snapshot

- `qwik-moviestracker` is a private Qwik City app for browsing movies and TV,
  authenticating with Google, reading curated MongoDB data, and interacting
  with TorrServer.
- The production path is Bun SSR packaged in Docker and deployed to Cloud Run by
  GitHub Actions on published GitHub releases.
- Stack baseline: Qwik / Qwik City 1.x, Tailwind CSS v4, daisyUI 5, Bun,
  Vite 7, and Biome 2.
- The source of truth is `src/`, `public/`, and root config files.

## Working Rules

- Edit `src/**`, `public/**`, and root config files.
- Do not hand-edit `dist/**` or `server/**` unless explicitly asked.
- Keep authenticated routes in `src/routes/(auth-guard)/`.
- Preserve the `lang` query parameter flow unless the task intentionally
  changes it.
- Keep integration logic in `src/services/**`.
- For monetization or public-commercial changes, check the commercial boundary
  in `references/guardrails.md` before adding paid access, ads, affiliate
  links, or public SEO surfaces.
- Prefer Bun commands.
- Follow the Qwik and daisyUI 5 rules in `references/ui-system.md` for all UI
  work.

## Verification

- Minimum verification after code changes:
  1. `bun run build.types`
  2. `bun run lint`
- Also run `bun run build` when routing, auth, SSR/runtime, env handling, or
  deployment is affected.
- Run `bun run verify` for DevOps, dependency, Docker, workflow, or broad app
  changes.

## Sharp Edges

- `dist/` and `server/` are generated output.
- `adapters/cloud-run/vite.config.ts` references `src/entry.cloud-run.tsx`,
  which does not currently exist.
- The repo has a small Bun-based automated test surface, but it is still narrow.
- `.env` and `adminSDK.json` must be treated as sensitive.
- Production deployment is GitHub Actions → Artifact Registry → Cloud Run.
  Keep the repo development + production only.
- gcloud's `--set-env-vars` breaks on URL values containing `://` and commas.
  Use `--env-vars-file` with YAML when setting multi-URL env vars.
- The Qwik SSR entry validates request host against `AUTH_URL` and
  `TRUSTED_ORIGINS`. Smoke tests should target the production URL after routing
  traffic rather than tagged `*.a.run.app` candidate URLs.
