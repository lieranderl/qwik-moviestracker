---
name: qwik-moviestracker
description: >-
  Use when working in the qwik-moviestracker repository and you need the
  project's architecture, commands, guardrails, or task-to-file routing.
metadata:
  category: reference
  triggers: qwik, qwik city, moviestracker, tmdb, torrserver, mongodb, bun, cloud run
---

# Qwik Moviestracker

Project-local skill for working efficiently in this repository.

## When To Use

- Editing features in this repo for the first time
- Fixing auth, routing, TMDB, MongoDB, or TorrServer behavior
- Running validation commands before finishing work
- Avoiding mistakes around generated files, env usage, or deployment

## What This Skill Covers

- Architecture map
- Common commands and verification
- Task routing to the right files
- Project-specific guardrails

## Read In This Order

1. `AGENTS.md`
2. `references/architecture.md`
3. `references/commands.md`
4. `references/guardrails.md`

Only open the reference file you need for the current task after `AGENTS.md`.

## Operating Guidance

1. Start from `src/`, not `dist/` or `server/`.
2. Keep auth logic centralized.
3. Preserve the `lang` query-param flow unless the task changes that behavior.
4. Keep external API logic in `src/services/**`.
5. Verify with type-check and lint before claiming completion.

## Reference Index

- `references/architecture.md` - Route map, service map, and key entry points
- `references/commands.md` - Bun commands and verification expectations
- `references/guardrails.md` - Secrets, generated files, deployment notes, and sharp edges
