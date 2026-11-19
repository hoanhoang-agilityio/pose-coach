---
name: ship
description: Use after a PR is merged by a human, to record the release, the metrics to watch and the rollback steps.
---

# ship

## Purpose
Write `release.md` for a merged change: what shipped, pipeline status, metrics
to watch, and how to roll back. Production deployment is approved by a human.

## Reads
- The merged PR, `intent/NNN-slug/{intent,plan,review}.md`.
- `intent/NNN-slug/design/infra.md` (deploy strategy, rollback) and `design/observability.md` (alerts, dashboards).
- CI status (`gh run list`, `gh pr view`, read only).
- `.sdlc/policies/*.md` for release rules.

## Writes
- `intent/NNN-slug/release.md` from `.claude/skills/ship/release-template.md`.

## Steps
1. Confirm the PR is merged (`gh pr view --json state,mergedAt`). If it is not,
   stop; a human merges.
2. Read the success metric in `intent.md` and the rollback in `plan.md`.
3. Fill What shipped with the PR link, merge commit and `intent/NNN-slug`.
4. Follow the deploy strategy in `design/infra.md` (flag, canary, blue-green): record
   which strategy applies and each rollout step in `release.md`.
5. Read pipeline status with read-only commands. Record each stage and whether
   the `production` environment approval is pending.
6. Fill Metrics to watch: the success metric plus guardrails (errors, latency,
   the area touched), with normal ranges and alert thresholds from
   `design/observability.md`. Verify the alerts and dashboards it lists are live
   (read only; ask the human to confirm anything you cannot see) and record
   "not verified" for any that are not. Ask the human for monitoring locations
   you cannot see.
7. Set a Watch window and name who is on point (ask the human).
8. Copy the rollback steps from `plan.md` and state the signal that triggers them.
9. Remove `.sdlc/active` if it names this change.
10. Commit only `release.md` on a short-lived branch `chore/NNN-slug-release`
   from the default branch (you cannot push to it); a human merges.

## Gate
Tell the human: review `intent/NNN-slug/release.md`, approve the `production`
environment in GitHub when ready, and set `status: accepted` themselves once the
watch window passes cleanly. If a metric breaches, use the `incident` skill.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept release`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`docs(NNN-slug): ship <summary>` (for example `docs(004-export-csv): add ship`)

## Don't
- Do not merge, deploy, trigger a production workflow or approve an environment.
- Do not touch production systems or data.
- Do not set `status: accepted`, `accepted_by` or `accepted_at`.
- Do not claim metrics are healthy without data; write "unknown" instead.
- Do not edit `plan.md` or other accepted artifacts.

## Next
If a metric breaches during the watch window: `incident`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
