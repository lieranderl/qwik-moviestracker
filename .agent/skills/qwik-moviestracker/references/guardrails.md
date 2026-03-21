---
description: >-
  Guardrails for working safely in qwik-moviestracker, covering secrets,
  generated files, deployment sharp edges, and repo-specific gotchas.
metadata:
  tags: [guardrails, secrets, generated-files, deployment, sharp-edges]
  source: project
---

# Guardrails

## Secrets

The repo uses environment variables for auth, database, and external API access.

Rules:

- Never print secret values in agent responses.
- Never paste `.env` contents into docs, issues, or commit messages.
- When debugging env problems, mention variable names only.

Expected variables include:

- `GOOGLE_ID`
- `GOOGLE_SECRET`
- `AUTH_SECRET`
- `MONGO_URI`
- `TMDB_API_KEY`
- `GC_API_KEY`
- `VITE_FIREBASE_CONFIG`

## Generated Output

Treat these as derived artifacts:

- `dist/**`
- `server/**`

Do not hand-edit them unless the user explicitly wants generated output changed.

## Deployment Sharp Edge

`adapters/cloud-run/vite.config.ts` references `src/entry.cloud-run.tsx`, but
that file does not exist.

Implication:

- Do not assume the Cloud Run adapter config is the active deployment path.
- The practical deployment path today is Bun SSR via `Dockerfile` and
  `cloudbuild.yaml`.

## Runtime Boundary

This repo mixes:

- Qwik env access via `env.get(...)`
- Node/Bun env access via `process.env.*`

Do not move server env reads into browser-only code. Keep server-side access in
services, loaders, or request handlers.

## Repo Hygiene

- Keep diffs narrow.
- Avoid mass reformatting unrelated files.
- Do not "fix" committed build output as part of unrelated work.
- Verify whether a file is actually used before deleting it. Example:
  `src/utils/fomat.ts` appears suspicious, but removal should follow usage
  verification.

## Feature Guardrails

- Preserve the `lang` query-param flow unless the task explicitly changes it.
- Keep authenticated routes inside `(auth-guard)` unless there is a clear public
  use case.
- Keep API access centralized in `src/services/**`.
