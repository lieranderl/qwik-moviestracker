---
description: >-
  UI system guidance for qwik-moviestracker, including daisyUI usage, shared
  page primitives, motion/focus behavior, and how to avoid fragmenting the UI.
metadata:
  tags: [ui, daisyui, components, motion, accessibility]
  source: project
---

# UI System

## Primary Rule

Use daisyUI as the default UI vocabulary. Reach for custom CSS only when the
existing daisyUI primitives plus project utilities cannot express the pattern
cleanly.

Reference: https://daisyui.com/components/

## Shared Primitives To Reuse First

| Need | Prefer |
|------|--------|
| page title / eyebrow | `SectionHeading` in `src/components/page-feedback.tsx` |
| loading / empty / error states | `LoadingState`, `EmptyState`, `ErrorState` |
| detail-page framing | `DetailPageShell`, `DetailPageContainer` |
| media lists | `MediaGrid`, `MediaCarousel`, `MediaCard` |
| discovery/home sections | `src/components/discovery/**` |
| app navigation | `src/components/toolbar/**` |

## Styling Conventions

- Favor daisyUI component classes plus small project utility classes.
- Keep long-lived tokens and global behavior in `src/global.css`.
- Keep page- or component-specific styling close to the component unless it is
  becoming a shared primitive.
- Preserve Catppuccin-based light/dark theme behavior.

## Interaction Patterns

- Prefer URL-backed state for search/filter flows when the page should be
  shareable or restorable.
- Keep focus-visible behavior intact by reusing the existing focus ring
  utilities and media-card link patterns.
- Preserve skip-link and main-content targeting behavior in the shell.
- Favor stat cards, alerts, badges, hero sections, and card-based grouping from
  daisyUI before inventing bespoke containers.

## Motion and Polish

- Motion already has shared timing/focus utilities in `src/global.css`.
- Reuse existing motion classes such as `page-enter`, `section-reveal`,
  `overlay-enter`, and `toolbar-shell` before adding new animation patterns.
- Prefer subtle motion that supports hierarchy and state changes; do not add
  decorative motion that competes with content.

## When To Extract A New Shared Primitive

Promote a pattern into a shared component when at least one of these is true:

- the same markup/state pattern appears in multiple routes
- the same UI convention must stay visually aligned across pages
- accessibility or interaction behavior would be safer centralized
- a user/team recommendation is likely to apply to future work too

When you create or significantly change a shared primitive, update this file or
`references/architecture.md` so future agents discover it quickly.
