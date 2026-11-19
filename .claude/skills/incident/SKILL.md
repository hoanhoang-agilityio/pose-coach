---
name: incident
description: Use when an alert, metric breach or bug report shows a control failed and the cause must be diagnosed and fed back into the chain.
---

# incident

## Purpose
Diagnose a breach, write `incident.md`, capture the lesson as a regression test,
an eval case for the reviewer, and a new draft intent for the fix. This closes
the loop.

## Reads
- The signal: alert, logs, metric, bug report (read only).
- The originating change `intent/MMM-slug/*` and its `review.md`/`release.md`,
  if known.
- `intent/MMM-slug/design/observability.md`: alerts (by id), SLOs and runbooks. Incidents normally start from one of these alerts; name it.
- `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`, `evals/review-cases/`.

## Writes
- `intent/NNN-slug/incident.md` from `.claude/skills/incident/template.md`.
- `evals/review-cases/NNN-slug.md`: the diff or bug pattern the reviewer should
  have caught.
- A new draft `intent/NNN+1-slug/intent.md` with `source: incident NNN`.
- The regression test is written later, as part of the fix's `build` (named in
  the incident and in the new intent).

## Steps
1. Pick the next number `NNN` for the incident; create `intent/NNN-slug/`.
2. Name the alert from `observability.md` that fired (or note that none did, which
   is itself a failed control). Follow its runbook for read-only checks.
   Collect the signal with read-only commands. Never run anything against
   production, never change production data or config.
3. Reconstruct a Timeline from logs and git history.
4. Identify the root cause and the control that should have caught it (intent,
   spec, tests, review, CI, monitoring). Be specific.
5. Describe the regression test that would have failed before the bug, with file
   and name. Do not implement it now.
6. Write the eval case `evals/review-cases/NNN-slug.md`: the buggy diff pattern,
   why it is wrong, and what a reviewer should have said.
7. Create a new intent directory with a draft `intent.md` for the fix: `source:
   incident NNN`, risk proposed by you (at least `medium` if `sensitivePaths`
   are involved), `status: draft`.
8. Write Impact, Fix and Follow-ups in `incident.md`; set severity as a proposal.
9. Create branch `fix/<new intent NNN+1-slug>` from the default branch and commit
   the incident, eval case and draft intent together on it.

## Gate
Tell the human: review `intent/NNN-slug/incident.md` and the new draft intent.
YOU set `status: accepted`, `accepted_by` and `accepted_at` on each. Then the
chain restarts at `spec` or `plan`.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept incident`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`docs(NNN-slug): incident <summary>` (for example `docs(004-export-csv): add incident`)

## Don't
- Never touch production: no deploys, rollbacks, data fixes or config changes.
  Propose them; humans do them.
- Do not set `status: accepted` on any artifact.
- Do not edit an accepted artifact; reopening is the human's action.
- Do not hotfix code here; the fix goes through intent, plan and build.
- Do not blame individuals; name the failed control.

## Next
The new draft intent starts the chain again at `spec` or `plan`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
