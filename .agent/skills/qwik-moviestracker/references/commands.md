---
description: >-
  Development, build, and verification commands for qwik-moviestracker,
  including the minimum checks expected before finishing a change.
metadata:
  tags: [commands, bun, build, lint, verify, workflow]
  source: project
---

# Commands

## Preferred Package Manager

Use Bun unless the task explicitly requires npm. The repo includes `bun.lockb`
and the runtime path is Bun-oriented.

## Common Commands

| Goal | Command |
|------|---------|
| Install dependencies | `bun install` |
| Start dev server | `bun start` |
| Lint | `bun run lint` |
| Type-check | `bun run build.types` |
| Full build | `bun run build` |
| Preview build | `bun preview` |
| Serve Bun SSR output | `bun run serve` |
| Prettier format | `bun run fmt` |
| Biome check/fix | `bun run biome` |

## Minimum Verification

For most code changes, run:

1. `bun run build.types`
2. `bun run lint`

Also run `bun run build` when changing:

- route structure
- SSR/runtime behavior
- auth
- env handling
- deployment config

## What Not To Rely On

- There is no established test suite in this repo.
- `package.json` contains a placeholder `deploy` script; deployment is actually
  described by `Dockerfile` and `cloudbuild.yaml`.

## Useful File Checks

When a task is unclear, inspect:

- `package.json`
- `vite.config.ts`
- `Dockerfile`
- `cloudbuild.yaml`
- `src/routes/plugin@auth.ts`
