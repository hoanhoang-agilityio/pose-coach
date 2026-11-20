---
name: incident
description: Use when an alert, metric breach or bug report shows a control failed and the cause must be diagnosed and fed back into the chain.
---

# incident

## Purpose
Diagnose a breach, write `incident.md`, and capture the lesson as a regression test, a reviewer eval case and a new draft spec for the fix.

## Reads
- The signal (alert, logs, metric, bug report; read only).
- The originating `intent/MMM-slug/*` (`spec`, `review`, `release`, `design`), if known.
- `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`, `evals/review-cases/`.

## Writes
- `intent/NNN-slug/incident.md` from `.claude/skills/incident/template.md`.
- `evals/review-cases/NNN-slug.md`: the diff or bug pattern a reviewer should have caught.
- A draft `intent/NNN+1-slug/spec.md` for the fix (`source: incident NNN`). The regression test is written later in `build`.

## Steps
1. Pick the next `NNN`; create `intent/NNN-slug/`.
2. Collect the signal with read-only commands; name the alert that fired (none firing is itself a failed control). Never run anything against production.
3. Reconstruct a timeline from logs and git history.
4. Name the root cause and the control that should have caught it (spec, tests, review, CI, monitoring).
5. Describe the regression test (file and name) that would have failed. Don't implement it.
6. Write the eval case, then the draft fix spec; risk `high` if `sensitivePaths` are involved.
7. Create `fix/<NNN+1-slug>` from the default branch and commit all three together.

## Gate
Human accepts the incident (`/accept incident` on the PR, or `npx github:hoanhoang-agilityio/ai-sdlc accept incident`) and the fix spec. The chain restarts at `spec` or `plan`.

## Don't
- Never touch production; propose, humans act.
- Don't set `status: accepted`, edit accepted artifacts or hotfix code here.
- Don't blame individuals; name the failed control.

## Next
`spec` or `plan` for the fix.
