# Copilot Instructions

See the root [`AGENTS.md`](../AGENTS.md) for the cross-agent contract and
[`CLAUDE.md`](../CLAUDE.md) for Claude Code project memory.

Working defaults:

- Edit `src/**`, `public/**`, and config files, not generated `dist/**` or
  `server/**`.
- Preserve the auth boundary in `src/routes/(auth-guard)/`.
- Preserve the `lang` query-param flow unless the task explicitly changes it.
- Keep external API logic in `src/services/**`.
- Treat env values and `.env` contents as sensitive.
- Prefer Bun commands.
- Open only the one matching file in `references/**` for the task instead of
  loading every project doc.
- Use daisyUI as the primary UI vocabulary.
- daisyUI reference: https://daisyui.com/components/

Verification baseline for code changes:

1. run the closest targeted test when one exists
2. `bun run build.types`
3. `bun run lint`
4. add `bun run build` for routing, runtime, auth, env, or deployment changes

If you discover stale guidance, update the corresponding Markdown file in the
same task instead of leaving it outdated.
