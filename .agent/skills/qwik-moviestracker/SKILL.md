---
name: qwik-moviestracker
description: >-
  Use when working in the qwik-moviestracker repository and you need concise,
  project-specific guidance for architecture, daisyUI-first UI work,
  verification, guardrails, or doc maintenance.
metadata:
  category: reference
  triggers:
    - qwik
    - qwik city
    - moviestracker
    - tmdb
    - torrserver
    - mongodb
    - bun
    - cloud run
    - daisyui
---

# Qwik Moviestracker

Project-local skill for working efficiently in this repository without
repeating obvious facts in every prompt.

## Start Here

1. Read `AGENTS.md`
2. Read only the reference file(s) needed for the task

## Reference Files

- `references/architecture.md` - route map, runtime shape, major UI/service
  areas
- `references/ui-system.md` - daisyUI-first patterns, shared UI primitives, and
  styling expectations
- `references/commands.md` - Bun commands, tests, and verification expectations
- `references/guardrails.md` - secrets, generated output, runtime boundaries,
  and repo sharp edges
- `references/maintenance.md` - how and when to update Markdown guidance files

## Use This Skill When

- editing or debugging routes, services, or auth flows
- changing UI and you need the repo’s daisyUI conventions
- validating work before completion
- deciding where project truth belongs in the Markdown docs

## Operating Guidance

1. Start from `src/`, not `dist/` or `server/`.
2. Keep auth logic centralized.
3. Preserve the `lang` query-param flow unless the task changes that behavior.
4. Keep external API logic in `src/services/**`.
5. Reuse the project’s shared UI primitives before inventing new ones.
6. Follow Qwik / Qwik City 1.x patterns and daisyUI 5 guidance from
   `references/ui-system.md` for UI work.
7. Keep behavior, verification, and documentation aligned in the same task.
8. Update the relevant Markdown reference when project truth changes.
