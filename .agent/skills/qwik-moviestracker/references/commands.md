---
description: >-
  Development, build, test, and verification commands for qwik-moviestracker,
  including the minimum checks expected before finishing a change.
metadata:
  tags: [commands, bun, build, lint, test, verify, workflow]
  source: project
---

# Commands

## Preferred Tooling

Use Bun unless the task explicitly requires npm. The repo includes `bun.lockb`
and the main runtime/build path is Bun-oriented.

## Common Commands

| Goal | Command |
|------|---------|
| Install dependencies | `bun install` |
| Start dev server | `bun start` |
| Run all repo tests | `bun test` |
| Run one test file | `bun test path/to/file.test.ts` |
| Type-check | `bun run build.types` |
| Lint | `bun run lint` |
| Full build | `bun run build` |
| Preview build | `bun preview` |
| Serve Bun SSR output | `bun run serve` |
| Format with Prettier | `bun run fmt` |
| Run Biome | `bun run biome` |

## Verification Baseline

For most code changes, run:

1. the closest targeted test if the touched behavior has coverage
2. `bun run build.types`
3. `bun run lint`

Also run `bun run build` when changing:

- route structure
- SSR/runtime behavior
- auth/session flow
- env handling
- deployment config
- shared UI primitives used across multiple routes

## Current Test Reality

- The repo has a lightweight Bun test suite.
- Current coverage is small but real, centered around search behavior:
  - `src/routes/(auth-guard)/search/search.logic.test.ts`
  - `src/routes/(auth-guard)/search/search.route.test.ts`
- If you fix or add behavior without existing coverage, add the narrowest useful
  test alongside the feature.

## Useful File Checks

When a task is unclear, inspect:

- `package.json`
- `vite.config.ts`
- `src/root.tsx`
- `src/routes/plugin@auth.ts`
- `src/routes/(auth-guard)/layout.tsx`
- the relevant file under `src/services/**`

## Known Command Caveat

`package.json` still contains a placeholder `deploy` script. Deployment truth
currently lives in `Dockerfile` and `cloudbuild.yaml`, not `bun deploy`.
