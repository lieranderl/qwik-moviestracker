# Moviestracker

Private Qwik City app for discovering movies and TV shows, opening rich detail
pages, authenticating with Google, reading curated/latest items from MongoDB
Atlas, and managing a connected TorrServer library.

## Stack

- Qwik + Qwik City
- Bun SSR runtime
- Auth.js with Google provider
- MongoDB Atlas for auth/session and curated content
- TMDB for media discovery
- daisyUI + Tailwind CSS v4 + Catppuccin themes
- Docker + Google Cloud Build / Cloud Run for the practical deploy path

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

Useful commands:

```bash
bun start
```

```bash
bun test
bun run test:e2e
bun run build.types
bun run lint
bun run build
```

`bun start` is still available as a convenience alias that opens the app in a
browser. `bun run dev` is the clearer command when you want the SSR dev server
without relying on browser auto-open behavior.

For the first local Playwright run, install the browser once:

```bash
bunx playwright install chromium
```

## Deployment Notes

- Preferred runtime output: Bun SSR via `src/entry.bun.ts`
- Build/deploy shape: `Dockerfile` + `cloudbuild.yaml`
- `adapters/cloud-run/vite.config.ts` exists, but it is not the current source
  of truth for deployment

## AI Agent Docs

Project-specific agent guidance lives in:

- [AGENTS.md](./AGENTS.md) - root operating contract
- [.agent/skills/qwik-moviestracker/SKILL.md](./.agent/skills/qwik-moviestracker/SKILL.md) - project-local skill entrypoint
- [.claude/skills/qwik-moviestracker/SKILL.md](./.claude/skills/qwik-moviestracker/SKILL.md) - Claude Code project skill
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - lightweight GitHub Copilot guidance

The docs are intentionally layered. Agents should update the corresponding
Markdown file whenever they discover stale guidance, changed behavior, new
verification steps, or new team preferences.
