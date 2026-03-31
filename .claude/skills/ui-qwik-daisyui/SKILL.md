---
name: ui-qwik-daisyui
description: Qwik / Qwik City 1.x and daisyUI 5 UI guidance for components, routes, and styling in this repo.
user-invocable: false
paths:
  - src/components/**
  - src/routes/**/*.tsx
  - src/global.css
---

# UI Qwik DaisyUI

Use this skill for UI and component work.

## Qwik Rules

- Use `component$` for components.
- Use `useSignal`, `useComputed$`, and `useTask$` for state and reactive work.
- Wrap JSX event-handler closures in `$()`.
- Keep `routeLoader$` in route and layout files only.
- Avoid `useVisibleTask$` unless browser-only APIs are required.
- Use `~/*` aliases for imports into `src/*`.

## DaisyUI 5 Rules

- Use daisyUI primitives before custom CSS.
- Use semantic daisyUI color tokens instead of hardcoded hex colors.
- Use daisyUI size modifiers for sizing consistency.
- Use the daisyUI modal dialog pattern with `<dialog class="modal">`.
- Keep theme and plugin changes in `src/global.css`.

## Repo Notes

- Use `.custom-container` for shared section width and horizontal padding.
- Respect reduced-motion behavior defined in `src/global.css`.
- Treat `font-qestero` and a shared `FadeUp` component as follow-up work until
  they exist in the codebase.
