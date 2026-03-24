# Copilot Instructions

Start with [AGENTS.md](../AGENTS.md). It is the root contract for agent work in
this repository.

Working defaults:

- use daisyUI as the primary UI vocabulary
- daisyUI reference: https://daisyui.com/components/
- edit `src/**`, `public/**`, and root config files
- treat `dist/**` and `server/**` as generated output
- preserve auth boundaries and the `lang` query parameter flow
- keep external API logic in `src/services/**`
- prefer Bun commands

Verification baseline for code changes:

1. run the closest targeted test when one exists
2. `bun run build.types`
3. `bun run lint`
4. add `bun run build` for routing, runtime, auth, env, or deployment changes

If you discover stale guidance, update the corresponding Markdown file in the
same task instead of leaving it outdated.
