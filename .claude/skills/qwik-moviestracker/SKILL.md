---
name: qwik-moviestracker
description: Repository onboarding and shared guidance for qwik-moviestracker. Use when you need the repo map or the general working contract before switching to path-scoped skills.
user-invocable: false
---

# Qwik Moviestracker

Use this skill for project onboarding and shared repo guidance.

## Read Order

1. `AGENTS.md`
2. `CLAUDE.md`
3. The one matching file in `references/**`

Do not load every reference file unless the task needs it. Prefer the
path-scoped skills for day-to-day work once you know which slice of the repo you
are changing.

## Working Defaults

- Edit `src/**`, `public/**`, and root config files.
- Treat `dist/**` and `server/**` as generated output.
- Keep authenticated routes under `src/routes/(auth-guard)/`.
- Preserve the `lang` query parameter flow.
- Keep TMDB, MongoDB, Cloud gateway, and TorrServer logic in `src/services/**`.
- Prefer Bun commands.
- Follow Qwik / Qwik City 1.x patterns and daisyUI 5 guidance from
  `references/ui-system.md` for UI and component work.
- Prefer the focused skills for auth, services, deployment, and UI work once the
  touched files are clear.

## Verification

- Minimum checks after code changes:
  1. `bun run build.types`
  2. `bun run lint`
- Also run `bun run build` for routing, auth, SSR/runtime, env, or deployment
  changes.

## Reference Index

- `references/architecture.md`
- `references/ui-system.md`
- `references/commands.md`
- `references/guardrails.md`
- `references/maintenance.md`
