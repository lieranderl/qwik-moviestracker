---
name: deploy-cloud-run
description: Deployment and runtime guidance for Bun SSR, Docker, Cloud Build, and Cloud Run in this repository.
user-invocable: false
paths:
  - Dockerfile
  - cloudbuild.yaml
  - gcloud_deploy.sh
  - vite.config.ts
  - src/entry.bun.ts
  - src/entry.preview.tsx
  - src/entry.ssr.tsx
  - adapters/**
---

# Deploy Cloud Run

Use this skill when changing runtime or deployment files.

## Core Rules

- Treat deployment changes as runtime changes, not docs-only edits.
- Bun SSR is the practical production path today.
- Be careful around `adapters/cloud-run/vite.config.ts` because it references a
  missing `src/entry.cloud-run.tsx`.
- Avoid touching generated `server/**` output directly.

## Verification

Always run:

1. `bun run build.types`
2. `bun run lint`
3. `bun run build`
