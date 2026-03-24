# Moviestracker

Private Qwik City app for browsing movies and TV, opening detailed media pages,
authenticating with Google, reading curated/latest items from MongoDB Atlas,
and managing a connected TorrServer library.

## Stack

- Qwik + Qwik City
- Bun SSR runtime
- Auth.js with Google provider
- MongoDB Atlas for auth/session and curated content
- TMDB for media discovery
- daisyUI + Tailwind CSS v4 + Catppuccin themes
- Docker + Google Cloud Build / Cloud Run for the practical deploy path

## App Areas

- `/auth` - login / landing page
- `/` - authenticated home dashboard
- `/movie/**` - movie discovery and detail pages
- `/tv/**` - TV discovery and detail pages
- `/person/**` - person detail pages
- `/search` - GET-based discovery search
- `/torrserver` - TorrServer connection and library management

## Development

```bash
bun install
bun start
```

Useful commands:

```bash
bun test
bun run build.types
bun run lint
bun run build
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
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - lightweight GitHub Copilot guidance

The docs are intentionally layered. Agents should update the corresponding
Markdown file whenever they discover stale guidance, changed behavior, new
verification steps, or new team preferences.
