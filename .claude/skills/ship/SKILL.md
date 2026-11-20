---
name: ship
description: Use after a PR is merged by a human, to record the release, the metrics to watch and the rollback steps.
---

# ship

## Purpose
Write `release.md` for a merged change: what shipped, metrics to watch, rollback. A human approves production.

## Reads
- The merged PR, `intent/NNN-slug/{spec,plan,review}.md`, `design/design.md` (deploy, observability).
- CI status (`gh run list`, `gh pr view`, read only), `.sdlc/policies/*.md`.

## Writes
- `intent/NNN-slug/release.md` from `.claude/skills/ship/release-template.md`.

## Steps
1. Confirm the PR is merged (`gh pr view --json state,mergedAt`); if not, stop.
2. Read the success metric in `spec.md` and the rollback in `plan.md`.
3. Record what shipped, the rollout strategy from `design.md`, and pipeline status (read-only), including whether production approval is pending.
4. List the success metric plus guardrails with normal ranges and thresholds. Write "not verified" or "unknown" for anything you cannot see; ask the human for monitoring links.
5. Set a watch window and who is on point (ask the human). Copy the rollback and its trigger signal.
6. Remove `.sdlc/active` if it names this change.
7. Commit only `release.md` on `chore/NNN-slug-release` from the default branch; a human merges.

## Gate
Human reviews `release.md`, approves the `production` environment in GitHub, and accepts after a clean watch window. A breach means `incident`.

## Don't
- Don't merge, deploy, approve environments or touch production.
- Don't claim metrics are healthy without data; don't set `status: accepted`.

## Next
On a breach: `incident`.
