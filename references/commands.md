# Commands

## Core Bun Commands

- Install dependencies: `bun install`
- Dev server: `bun run dev`
- Browser-opening dev alias: `bun start`
- Type-check: `bun run build.types`
- Lint: `bun run lint`
- Test: `bun run test`
- Playwright smoke test: `bun run test:e2e`
- Full build: `bun run build`
- Preview build: `bun preview`
- Serve Bun SSR output: `bun run serve`
- Optional formatting: `bun run fmt`
- Optional Biome pass: `bun run biome`

## Minimum Verification

Run these after code changes unless the task is documentation-only:

1. `bun run build.types`
2. `bun run lint`

Add:

3. `bun run test` when the touched area already has coverage or when behavior can
   be locked with a focused Bun test
4. `bun run build`

when the task touches:

- routing
- auth
- SSR/runtime behavior
- environment usage
- deployment config

Optional frontend verification:

5. `bun run test:e2e` for auth-page and browser smoke checks

First-time local browser setup:

- `bunx playwright install chromium`
- The checked-in Playwright config starts the dev server with
  `PLAYWRIGHT_AUTH_BYPASS=1` so authenticated home, search, and detail smoke
  tests can run against dev-only fixtures.

## GitHub Actions CI

The repo CI workflow lives at `.github/workflows/ci.yml`.

It currently runs on push and pull request with:

1. `bun install --frozen-lockfile`
2. `bun run build.types`
3. `bun run lint`
4. `bun run test`
5. `bun run build`

## Claude + Codex Workflow

For non-trivial work:

1. Claude Code starts in plan mode.
2. Save the phased plan in `plans/<task>.md`.
3. Codex reviews the plan against the real codebase and appends findings.
4. Claude Code implements phase-by-phase.
5. Codex verifies the result and the final verification commands are rerun.

## Claude Slash Workflows

Project-local command workflows live in `.claude/commands/**`.

- `/plan-feature` - create or update a phased plan in `plans/<task>.md`
- `/verify-repo` - run the repo verification workflow
- `/review-auth` - launch the auth review workflow
- `/ui-check` - run a Qwik/daisyUI UI check with Playwright when available
- `/deploy-check` - review Bun SSR, Docker, Cloud Build, and Cloud Run changes

## Useful Session Guidance

- Use plan mode first for complex tasks.
- Use worktrees for independent parallel tasks.
- Use project skills instead of pasting long repeated instructions into prompts.
