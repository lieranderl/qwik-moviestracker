---
description: >-
  Maintenance policy for agent-facing Markdown files in qwik-moviestracker,
  including when to update them, where project truth belongs, and how to keep
  docs concise and current.
metadata:
  tags: [maintenance, docs, agents, freshness, process]
  source: project
---

# Maintenance

## Principle

Agent-facing Markdown is living project infrastructure, not static prose.

If you discover that a doc is stale, incomplete, misleading, or missing a new
team preference, update it in the same task instead of leaving the mismatch for
later.

## Update The Docs When You Notice

- an incorrect statement
- a renamed or moved source file
- a changed workflow or verification command
- a new automated test or removed test
- a repeated user recommendation that should become a standing convention
- a new sharp edge, invariant, or deployment/runtime caveat
- a new shared UI primitive or architecture pattern

## Where Each Truth Belongs

- `AGENTS.md`
  Root contract, defaults, verification baseline, and doc-freshness rule.
- `README.md`
  Human/project overview and links to the agent docs.
- `references/architecture.md`
  Route map, service map, runtime shape, shared building blocks.
- `references/ui-system.md`
  daisyUI conventions, shared UI primitives, styling/motion guidance.
- `references/commands.md`
  commands, tests, verification expectations, command caveats.
- `references/guardrails.md`
  secrets, generated files, runtime boundaries, invariants, sharp edges.

## Anti-Patterns

Avoid:

- copying the same project summary into every Markdown file
- burying operational rules inside long architecture prose
- keeping outdated statements because they were once true
- adding speculative “best practices” that are not reflected in the repo

## Best-Practice Rule

When “latest trends” or “best practice” guidance changes, only update the docs
if it should become a standing repo convention. Tie the guidance back to how
this codebase actually works.

Examples:

- good: “prefer GET-based search forms because the route is URL-backed and
  tested that way”
- bad: “always use pattern X because it is trendy” without repo evidence

## End-Of-Task Check

Before finishing a task, ask:

1. Did project truth change?
2. Did I discover any stale guidance?
3. Did the user give a reusable recommendation?

If any answer is yes, update the corresponding Markdown file before closing the
task.
