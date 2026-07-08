# Commands

## Core Bun Commands

- Install dependencies: `bun install`
- Dev server: `bun run dev`
- Browser-opening dev alias: `bun start`
- Type-check: `bun run build.types`
- Lint: `bun run lint`
- Test: `bun run test`
- Playwright smoke test: `bun run test:e2e:smoke`
- Full Playwright suite: `bun run test:e2e`
- Full build: `bun run build`
- Full local verification: `bun run verify`
- Preview build: `bun preview`
- Serve Bun SSR output: `bun run serve`
- Optional formatting: `bun run fmt`
- Optional Biome pass: `bun run biome`
- Deployment smoke check: `./scripts/smoke-deployment.sh <url>`

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

5. `bun run test:e2e:smoke` for the stable CI browser smoke subset
6. `bun run test:e2e` for broader browser coverage after repairing or accepting
   currently red full-suite expectations

For DevOps, dependency, Docker, workflow, or broad app changes, run:

```bash
bun run verify
```

First-time local browser setup:

- `bunx playwright install chromium`
- The checked-in Playwright config starts the dev server with
  `PLAYWRIGHT_AUTH_BYPASS=1` so authenticated home, search, and movie/TV/person
  detail smoke tests can run against dev-only fixtures.

## GitHub Actions CI/CD

The repo quality workflow lives at `.github/workflows/quality.yml`.

It runs on pull requests, pushes to `main`, manual dispatch, and reusable
workflow calls with:

1. `bun install --frozen-lockfile`
2. `bun run build.types`
3. `bun run lint`
4. `bun run test`
5. `bun run build`
6. `bun audit --audit-level=high`
7. Playwright Chromium smoke subset
8. gitleaks secret scanning
9. Docker build/run smoke test
10. Trivy high/critical container scan

Production deployment lives at `.github/workflows/deploy.yml`.

- Trigger: published GitHub release only.
- Branch model: PRs merge to `main`; `main` is the development integration
  branch. No other long-lived runtime branch or environment exists.
- Deployment model: build once, scan the local image, push clean image to
  Artifact Registry, attest/SBOM, deploy a no-traffic Cloud Run candidate,
  smoke-test, canary 10%, promote to 100%, or roll back to the previous
  revision.
- GCP auth: GitHub OIDC / Workload Identity Federation. Never use checked-in or
  GitHub-stored service-account keys.

Required repository or production environment variables:

- `GCP_PROJECT`
- `GCP_REGION`
- `GAR_REPOSITORY`
- `IMAGE_NAME`
- `PROD_SERVICE`
- `PROD_URL`
- `GOOGLE_ID`
- `GCP_WORKLOAD_ID_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

Required Secret Manager secret names expected by the deploy workflow:

- `AUTH_SECRET`
- `GOOGLE_SECRET`
- `MONGO_URI`
- `TMDB_API_KEY`
- `GC_API_KEY`

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
- `/deploy-check` - review Bun SSR, Docker, GitHub Actions, and Cloud Run
  changes

## Useful Session Guidance

- Use plan mode first for complex tasks.
- Use worktrees for independent parallel tasks.
- Use project skills instead of pasting long repeated instructions into prompts.
