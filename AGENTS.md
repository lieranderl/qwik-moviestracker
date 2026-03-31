# AGENTS.md

Use this file as the root contract for AI agents working in this repository.
Keep it short, operational, and non-repetitive. Deeper project truth lives in
the skill reference files linked below.
the reference files and project memory files linked below.

## Read Order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.agent/skills/qwik-moviestracker/SKILL.md`
4. The one reference file that matches the current task

Reference files:

- `references/architecture.md`
- `references/ui-system.md`
- `references/commands.md`
- `references/guardrails.md`
- `references/maintenance.md`

Do not load every reference by default. Open only what the task needs.

## Working Defaults

- Stack baseline: Qwik / Qwik City 1.x, Tailwind CSS v4, daisyUI 5, Bun,
  Vite 7, and Biome 2.
- Use daisyUI as the primary UI vocabulary.
- Reference: https://daisyui.com/components/
- Edit `src/**`, `public/**`, and root config files.
- Treat `dist/**` and `server/**` as generated output.
- Keep authenticated pages inside `src/routes/(auth-guard)/` unless the task
  explicitly introduces a public flow.
- Preserve the `lang` query parameter flow unless the task changes language
  behavior on purpose.
- Keep TMDB, MongoDB, Cloud gateway, and TorrServer integration logic in
  `src/services/**`.
- Prefer Bun commands over npm when both are possible.
- Follow Qwik patterns and daisyUI 5 rules in `references/ui-system.md` for
  all component and styling work.
- For Claude Code, keep project automation in `.claude/**` and keep the root
  `CLAUDE.md` concise. Put durable detail in `references/**`. Project-scoped
  MCP config lives in `.mcp.json`.
- For cross-model work, prefer: Claude Code plans, Codex reviews the plan
  against the codebase, Claude implements, Codex verifies.

## Verification

- For bug fixes and behavior changes, use test-first when practical.
- Run the closest targeted test for the behavior you touched when one exists.
- Minimum verification for code changes:
  1. `bun run build.types`
  2. `bun run lint`
- Also run `bun run build` for routing, SSR/runtime, auth, environment, or
  deployment changes.
- After integrating subagent work, rerun the appropriate project-level checks
  before declaring success.

## Documentation Freshness Rule

Markdown guidance files are part of the project infrastructure.

Agents must update the corresponding Markdown file in the same task when they
discover any of the following:

- an incorrect statement
- stale architecture or workflow guidance
- changed verification commands or new tests
- a new recurring user recommendation or team preference
- a new sharp edge, invariant, or maintenance rule

Put updates in the right file instead of repeating the same fact everywhere:

- architecture and file map -> `references/architecture.md`
- UI conventions and reusable patterns -> `references/ui-system.md`
- commands and verification -> `references/commands.md`
- safety rules and repo invariants -> `references/guardrails.md`
- how to keep docs current -> `references/maintenance.md`

## Finish Standard

A good agent change in this repo is:

- scoped to real source files
- aligned with existing daisyUI/Qwik patterns
- verified before completion
- careful with secrets and generated output
- accompanied by doc updates when truth changed
