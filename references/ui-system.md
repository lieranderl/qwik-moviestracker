# UI System

## Stack Baseline

- UI work targets Qwik / Qwik City 1.x.
- Styling targets Tailwind CSS v4 and daisyUI 5.
- Tooling baseline for frontend work is Bun + Vite 7 + Biome 2.

## Qwik Patterns

- Always use `component$` for components.
- Use Qwik state primitives such as `useSignal`, `useComputed$`, and `useTask$`.
- Do not introduce React state patterns such as `useState`.
- Closures passed to JSX event handlers must use `$()`.
- Keep `routeLoader$` in route and layout files only, never in components.
- Use `~/*` path aliases for imports that resolve into `src/*`.
- Avoid `useVisibleTask$` unless client-only browser APIs are genuinely
  required. Prefer `useTask$` with server guards when possible.
- Existing `useVisibleTask$` usage in the repo should be treated as legacy and
  migrated opportunistically when the touched behavior allows it.

## DaisyUI 5

- DaisyUI 5 is the mandatory UI library for primitives.
- Use DaisyUI component classes such as `btn`, `card`, `modal`, `dropdown`,
  `rating`, `badge`, `divider`, `link`, and `carousel` before writing custom
  CSS.
- Use DaisyUI semantic color tokens such as `bg-base-100`,
  `text-base-content`, `btn-primary`, and `bg-primary`.
- Do not hardcode hex colors unless a one-off design-system exception is
  intentional.
- Use DaisyUI size modifiers such as `btn-sm`, `btn-lg`, and `card-body` for
  sizing consistency.
- Modal dialogs should use the daisyUI `<dialog class="modal">` pattern with a
  `.modal-box` container.
- When a daisyUI component exists for the use case, use it instead of
  rebuilding the primitive.

## Current UI Anchors

- Root shell lives in `src/root.tsx`.
- Protected layout chrome lives in `src/routes/(auth-guard)/layout.tsx`.
- Toolbar components live in `src/components/toolbar/**`.

## Styling Guidance

- Tailwind v4 uses CSS-first configuration. Do not add `tailwind.config.js`
  unless there is a deliberate migration away from the current setup.
- Theme tokens and theme-plugin changes belong in `src/global.css`.
- If theme overrides expand beyond the current plugin setup, place them in a
  `@plugin "daisyui/theme"` block in `src/global.css`.
- The repo already defines `.custom-container` in `src/global.css`; use it for
  section max-width and horizontal padding.
- The repo already defines reduced-motion handling in `src/global.css`; do not
  bypass it with animation-only components.
- Start mobile-first and layer `md:` and `lg:` breakpoints on top.
- Keep classes localized to the component being changed.
- Avoid broad visual rewrites unless the task is explicitly design-focused.

## Accessibility

- Keep the skip link in `src/root.tsx` functional.
- Maintain semantic headings and a single main content region.
- Do not remove focus styles without replacing them.

## Interaction Patterns

- Preserve the `lang` query parameter when adding navigation.
- Keep authenticated shell behavior inside the auth-guard layout.
- Avoid duplicating toasts, theme logic, or app-shell concerns inside pages.

## Typography And Motion

- Current repo reality: headings use `font-montserrat` and the body still uses
  `font-inter` in `src/global.css` and `src/root.tsx`.
- New design-system preference: heading/display typography should move toward
  `font-qestero` and body typography should standardize on `font-montserrat`.
- Current repo reality: shared motion uses utility classes and keyframes in
  `src/global.css`.
- New design-system preference: if a shared `FadeUp` component is introduced,
  use it for scroll-triggered reveal behavior instead of ad hoc duplicates.
- Until `font-qestero` and a shared `FadeUp` component exist in the codebase,
  do not document them as already implemented assets.

## UI Change Heuristics

- Page-level feature change: edit the route and the smallest supporting
  component set.
- Shared chrome change: start in `src/routes/(auth-guard)/layout.tsx` and
  `src/components/toolbar/**`.
- Media detail polish: check `src/components/media-details/**` before creating
  new patterns.
