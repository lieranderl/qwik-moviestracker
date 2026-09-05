---
name: media-services
description: Guidance for TMDB, Firestore, Cloud gateway, and TorrServer service-layer work in qwik-moviestracker.
user-invocable: false
paths:
  - src/services/**
---

# Media Services

Use this skill when changing the service layer or integration behavior.

## Core Rules

- Keep external API clients in `src/services/**`.
- Do not duplicate network client creation inside route components.
- Respect server/runtime boundaries for environment access.
- Preserve typed service interfaces and keep fetch helpers reusable.
- Firestore access is server-only and uses Application Default Credentials.
  Do not introduce database credentials or a client-side Firestore SDK.
- Keep movie catalog pagination cursor-based; treat cursors as opaque values.

## Service Map

- `src/services/tmdb.ts`
- `src/services/cloud-func-api.ts`
- `src/services/firestore.ts`
- `src/services/torrserver.ts`

## Verification

- Run `bun run build.types`
- Run `bun run lint`
- Run `bun run build` when service changes affect auth, route data flow, SSR, or
  deployment behavior
