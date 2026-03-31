---
name: auth-stack
description: Auth and protected-route guidance for qwik-moviestracker. Auto-load when working on auth configuration, sessions, redirects, or protected layouts.
user-invocable: false
paths:
  - src/routes/plugin@auth.ts
  - src/routes/(auth-guard)/**
  - src/routes/auth/**
---

# Auth Stack

Use this skill when changing authentication, session handling, or protected
routes.

## Core Rules

- Keep auth logic centralized in `src/routes/plugin@auth.ts`.
- Keep protected-route enforcement inside `src/routes/(auth-guard)/layout.tsx`.
- Preserve the `lang` query parameter flow when changing redirects or links.
- Be careful with the JWT fallback path used during build or SSG when Mongo is
  unavailable.

## Verification

- Always run:
  1. `bun run build.types`
  2. `bun run lint`
- Also run:
  3. `bun run build`

Auth and route changes are always full-build territory in this repo.
