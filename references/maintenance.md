# Maintenance

## Purpose

These markdown files are part of the repository infrastructure. Keep them in
sync with how the repo actually works.

## Update Rules

Update docs in the same task when you discover:

- a missing or incorrect instruction
- a changed command or verification step
- a changed architecture boundary
- a new recurring sharp edge
- a new team preference for agent workflows

## Where Changes Go

- `AGENTS.md`: cross-agent root contract
- `references/architecture.md`: file map, runtime shape, route/service boundaries
- `references/ui-system.md`: UI conventions and reusable patterns
- `references/commands.md`: commands, verification, and workflow steps
- `references/guardrails.md`: secrets, generated output, invariants, sharp edges
- `.mcp.json`: project-scoped MCP server definitions
- `.claude/settings.json`: shared project settings
- `.claude/commands/**`: reusable workflow entrypoints
- `.claude/agents/**`: bounded review and exploration agents
- `.claude/hooks/**`: deterministic guardrails and workflow reminders
- `.claude/skills/**`: task-oriented agent guidance
- `.github/workflows/**`: repository CI and automation entrypoints
- `.agent/skills/**`: local agent guidance that must stay aligned

## Consistency Rules

- Do not repeat the same long guidance in every file.
- Keep root files short and point to the right deeper document.
- When agent workflow changes, update the relevant tooling directory and
  `references/commands.md`.
- When repo-wide truths change, update `AGENTS.md` and the matching reference.

## Review Trigger

Any task that changes agent workflow, repo verification, or project structure
should include a quick doc consistency check before completion.
