# CLAUDE.md

This file provides project memory for Claude Code in this repository.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `references/architecture.md` or the one reference file that matches the task
4. `.claude/skills/qwik-moviestracker/SKILL.md` when deeper repo guidance is needed

## Project Snapshot

- `qwik-moviestracker` is a private Qwik City app for browsing movies and TV,
  authenticating with Google, reading curated MongoDB data, and interacting
  with TorrServer.
- The practical production path is Bun SSR packaged in Docker and deployed with
  Cloud Build / Cloud Run.
- Stack baseline: Qwik / Qwik City 1.x, Tailwind CSS v4, daisyUI 5, Bun,
  Vite 7, and Biome 2.
- The source of truth is `src/`, `public/`, and root config files.

## Working Rules

- Edit `src/**`, `public/**`, and root config files.
- Do not hand-edit `dist/**` or `server/**` unless the user explicitly asks.
- Keep authenticated routes in `src/routes/(auth-guard)/`.
- Preserve the `lang` query parameter flow unless the task intentionally
  changes it.
- Keep integration logic in `src/services/**`.
- Prefer Bun commands.
- Follow the Qwik and daisyUI 5 rules in `references/ui-system.md` for all UI
  work.

## Claude Code Workflow

- Start complex work in plan mode before editing.
- Keep context small. Open one reference file at a time and use `/clear`
  between unrelated tasks.
- Use project skills for repo guidance and verification instead of repeating the
  same instructions in prompts.
- Use bounded subagents for isolated review or exploration, not for vague
  “handle everything” tasks.
- Use git worktrees for parallel sessions when tasks are independent.
- Shared Claude settings live in `.claude/settings.json`.
- Project-scoped MCP servers live in `.mcp.json`.
- Project-local hooks block protected-path edits and enforce required
  verification before session stop for tracked code changes.

## Cross-Model Workflow

- Claude Code: plan and phase the work.
- Codex: review the plan against the actual codebase and add findings.
- Claude Code: implement phase-by-phase with verification gates.
- Codex: verify the implementation against the agreed plan.

Store reusable plans in `plans/`.

## Verification

- Minimum verification after code changes:
  1. `bun run build.types`
  2. `bun run lint`
- Also run `bun run build` when routing, auth, SSR/runtime, env handling, or
  deployment is affected.

## Sharp Edges

- `dist/` and `server/` are generated output.
- `adapters/cloud-run/vite.config.ts` references `src/entry.cloud-run.tsx`,
  which does not currently exist.
- The repo has a small Bun-based automated test surface, but it is still narrow.
- `.env` and `adminSDK.json` must be treated as sensitive.

## Personal Overrides

- Use `CLAUDE.local.md` for personal, non-shared preferences.
- Use `.claude/settings.local.json` for local Claude Code overrides.
- Neither file should be committed.
