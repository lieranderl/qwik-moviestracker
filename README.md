# Moviestracker

[![CI](https://github.com/lieranderl/qwik-moviestracker/actions/workflows/quality.yml/badge.svg)](https://github.com/lieranderl/qwik-moviestracker/actions/workflows/quality.yml)
[![Last Commit](https://img.shields.io/github/last-commit/lieranderl/qwik-moviestracker)](https://github.com/lieranderl/qwik-moviestracker/commits/main)
[![Issues](https://img.shields.io/github/issues/lieranderl/qwik-moviestracker)](https://github.com/lieranderl/qwik-moviestracker/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/lieranderl/qwik-moviestracker)](https://github.com/lieranderl/qwik-moviestracker/pulls)
[![Stars](https://img.shields.io/github/stars/lieranderl/qwik-moviestracker)](https://github.com/lieranderl/qwik-moviestracker/stargazers)
[![Top Language](https://img.shields.io/github/languages/top/lieranderl/qwik-moviestracker)](https://github.com/lieranderl/qwik-moviestracker)

Authenticated Qwik City app for discovering movies and TV shows, opening rich detail
pages, authenticating with Google, reading curated/latest items from Firestore,
and managing a connected TorrServer library.

Any Google account with a verified email address may sign in. This is broad
authenticated access, not a private email allowlist.

## Stack

- Qwik + Qwik City
- Bun SSR runtime
- Auth.js with Google provider
- Firestore Native for curated content; signed JWT sessions for Auth.js
- TMDB for media discovery
- daisyUI + Tailwind CSS v4 + Catppuccin themes
- Docker + GitHub Actions + Google Artifact Registry / Cloud Run for production

## App Areas

- `/auth` - branded Google sign-in / landing page
- `/` - authenticated discovery dashboard with spotlight, continue-browsing, and carousel sections
- `/movie/**` - movie discovery and detail pages
- `/tv/**` - TV discovery and detail pages
- `/person/**` - person detail pages
- `/search` - GET-based discovery search
- `/torrserver` - TorrServer connection and library management

## Development

```bash
bun install
bun run dev
```

Development and CI use Bun 1.3.14, pinned in `packageManager`, `.mise.toml`,
and the Docker images.

Useful commands:

```bash
bun start
```

```bash
bun test
bun run test:e2e:smoke
bun run test:e2e
bun run build.types
bun run lint
bun run build
bun run verify
```

`bun start` is still available as a convenience alias that opens the app in a
browser. `bun run dev` is the clearer command when you want the SSR dev server
without relying on browser auto-open behavior.

For the first local Playwright run, install the browser once:

```bash
bunx playwright install chromium
```

## Deployment

Production deploys run automatically when a GitHub release is published. The
pipeline builds the app into a Docker image, scans it for vulnerabilities, pushes
it to Google Artifact Registry, updates only the immutable Cloud Run image
revision, verifies the candidate health endpoint, and then verifies the
production URL with a smoke test. If anything fails, traffic rolls back to the
last healthy revision automatically.

OpenTofu in the backend infrastructure directory owns Cloud Run configuration,
runtime environment and secret bindings, IAM, and alerting. IMDb calls use the
private service URL and Google ID tokens; GC_API_KEY exists only during the
one-release gateway fallback.

Measure authenticated SSR before and after a release with
`SSR_BENCH_COOKIE=... bun run bench:ssr -- https://service.example`. Preserve
the JSON output as release evidence; it records p50/p95/p99 and 5xx counts for
Home, Movies, and TV while Cloud Monitoring records instances and requests.

- Only one production path exists: GitHub Actions → Artifact Registry → Cloud Run
- GCP authentication uses Workload Identity Federation — no service-account keys
  are stored in the repository
- The repository supports development and production environments only
