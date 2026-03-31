---
name: verify-repo
description: Final verification workflow for qwik-moviestracker. Use before claiming completion after code changes in this repository.
argument-hint: [changed-area]
allowed-tools: Read, Grep, Bash(bun run build.types), Bash(bun run lint), Bash(bun run build)
---

# Verify Repo

Run the smallest verification set that honestly matches the change.

## Default Verification

Always run:

1. `bun run build.types`
2. `bun run lint`

## Add Full Build When Needed

Also run `bun run build` when the task touched:

- routing
- auth
- SSR/runtime behavior
- environment usage
- deployment config

## Reporting

- Report exactly which commands ran.
- If a command fails, summarize the failure precisely.
- Do not claim the task is complete if required verification did not run.
