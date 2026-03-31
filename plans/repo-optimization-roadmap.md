# Repo Optimization Roadmap

## Goals

- Reduce large mixed-concern route files into smaller, testable modules.
- Tighten server/runtime boundaries so secrets and environment failures are explicit.
- Remove duplicated page logic where the UI and data flow are structurally the same.
- Improve verification and agent workflow so repo guidance matches actual practice.

## Findings

### High priority

1. `src/routes/(auth-guard)/torrserver/index.tsx`
   - The route is very large and mixes browser persistence, normalization, connection state, data parsing, action handlers, and rendering in one file.
   - This area already regressed once during lifecycle cleanup, which is a sign that the logic needs smaller boundaries and tests.

2. `src/routes/(auth-guard)/movie/category/[name]/index.tsx`
   - Duplicates most of the infinite-scroll page state and rendering structure used by the TV category page.
   - Reads `MONGO_URI` directly in both the loader and via a second route loader import from the layout.

3. `src/routes/(auth-guard)/tv/category/[name]/index.tsx`
   - Mirrors the movie category route with near-identical page state and observer wiring.
   - The duplicate structure raises maintenance cost for any future pagination or skeleton-state change.

4. `src/services/tmdb.ts`
   - Uses `process.env.TMDB_API_KEY || ""`, which silently degrades into bad requests instead of failing clearly.
   - The same module also performs a large amount of fan-out fetching for backdrop enrichment, which makes explicit runtime safeguards more important.

5. `src/services/cloud-func-api.ts`
   - Uses `process.env.GC_API_KEY || ""`, which has the same silent-failure problem as TMDB access.

### Medium priority

6. `package.json`
   - `lint` only covers `src/**/*.ts*`, so config files, workflow files, and tests can drift outside the main verification path.
   - Dependency versions still include `latest`, and `typescript-eslint` versions are inconsistent.

7. `.claude/hooks/common.mjs`
   - Verification enforcement knows about type-check, lint, and full build, but not about focused test execution.
   - Agent workflow is stronger than before, but it still cannot enforce the "run the closest targeted test" rule from `AGENTS.md`.

8. `references/guardrails.md`, `references/architecture.md`, `CLAUDE.md`
   - Some guidance still lags repo reality, especially around test maturity and route sharp edges.

## Execution order

### Phase 1

- Extract TorrServer route logic into route-local pure modules.
- Add focused Bun tests for the extracted logic.
- Keep the UI behavior unchanged.

### Phase 2

- Introduce a shared paginated media-category pattern for movie and TV category pages.
- Remove duplicated observer and pagination state handling.
- Keep route loaders in route files.

### Phase 3

- Add a small server-env helper and replace silent empty-string fallbacks in service clients.
- Fail fast with descriptive errors for missing server secrets.

### Phase 4

- Tighten repo tooling:
  - broaden lint coverage or add a second repo-level lint command
  - pin remaining `latest` dependencies
  - align `typescript-eslint` package versions

### Phase 5

- Improve agent workflow:
  - teach verification hooks about targeted tests
  - document path-to-test expectations in `references/commands.md`
  - add one more repo-local agent or skill for route-level runtime audits

## Current tranche

Immediate safety fix before Phase 1:

- remove the `MONGO_URI` route-loader leak from the auth-guard layout
- move Mongo-backed route data access back to server-only boundaries
- add a guard test so the layout cannot reintroduce serialized secret state

Then continue with Phase 1:

- create a route-local TorrServer state/helpers module
- move pure parsing and persistence logic out of the route
- add tests for the extracted module
- update docs if the new boundaries change repo truth
