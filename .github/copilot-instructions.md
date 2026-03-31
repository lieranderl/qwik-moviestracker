# Copilot Instructions

See the root [`AGENTS.md`](../AGENTS.md) for the cross-agent contract and
[`CLAUDE.md`](../CLAUDE.md) for Claude Code project memory.

When working in this repository:

- Edit `src/**`, `public/**`, and config files, not generated `dist/**` or
  `server/**`.
- Preserve the auth boundary in `src/routes/(auth-guard)/`.
- Preserve the `lang` query-param flow unless the task explicitly changes it.
- Keep external API logic in `src/services/**`.
- Treat env values and `.env` contents as sensitive.
- Prefer Bun commands.
- Open only the one matching file in `references/**` for the task instead of
  loading every project doc.

Minimum verification before finishing:

1. `bun run build.types`
2. `bun run lint`

Run `bun run build` for auth, routing, SSR/runtime, env, or deployment changes.
