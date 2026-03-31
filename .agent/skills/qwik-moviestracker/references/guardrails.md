---
description: >-
  Guardrails for working safely in qwik-moviestracker, covering secrets,
  generated files, runtime boundaries, route invariants, and repo sharp edges.
metadata:
  tags: [guardrails, secrets, generated-files, runtime, auth, sharp-edges]
  source: project
---

# Guardrails

## Secrets

Expected environment variables include:

- `GOOGLE_ID`
- `GOOGLE_SECRET`
- `AUTH_SECRET`
- `MONGO_URI`
- `TMDB_API_KEY`
- `GC_API_KEY`
- `VITE_FIREBASE_CONFIG`

Rules:

- Never print secret values in agent responses.
- Never paste `.env` contents into docs, issues, or commit messages.
- When debugging env problems, mention variable names only.

## Generated Output

Treat these as derived artifacts:

- `dist/**`
- `server/**`

Do not hand-edit them unless the user explicitly wants generated output changed.

## Runtime Boundary

This repo mixes:

- Qwik request/env access via loaders and handlers
- Bun/Node env access via `process.env.*` in service code

Do not move server-side env reads into browser-only code.

## Route and State Invariants

- Keep auth enforcement centralized in `src/routes/plugin@auth.ts` and
  `src/routes/(auth-guard)/layout.tsx`.
- Preserve the `lang` query parameter flow unless the task intentionally
  changes language behavior.
- Keep external API access centralized in `src/services/**`.
- Prefer GET-friendly search/query flows when the URL should reflect state.

## UI/System Invariants

- Keep daisyUI as the primary component vocabulary.
- Reuse shared UI primitives before adding new one-off patterns.
- Avoid introducing competing UI systems or custom CSS abstractions when daisyUI
  and existing components already cover the need.

## Repo Sharp Edges

- `adapters/cloud-run/vite.config.ts` references `src/entry.cloud-run.tsx`,
  which does not exist.
- `package.json` still contains a placeholder deploy script.
- Generated output is committed, so diff noise is easy to create accidentally.
- Some project knowledge changes quickly; check `references/maintenance.md`
  before assuming a doc is still correct.
