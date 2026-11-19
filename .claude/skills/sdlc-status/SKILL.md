---
name: sdlc-status
description: Use any time the human asks where things stand, which changes exist, or which gate is waiting on them.
---

# sdlc-status

## Purpose
Report every change in `intent/` and its next human gate. Read-only: it writes
nothing.

## Reads
- `intent/*/{intent,spec,plan,build-log,review,release,incident}.md`,
  `intent/*/design/design.md` and the artifacts in its `requires:`
  (frontmatter `status` and `risk`).
- `.sdlc/active`, `.sdlc/config.json`, `.sdlc/bypass.log` if present.
- Optionally the output of `npx github:hoanhoang-agilityio/ai-sdlc status`.

## Writes
Nothing.

## Steps
1. List the directories in `intent/` (skip `README.md`).
2. For each change read the frontmatter of each artifact: `status` (draft,
   accepted, rejected) and `risk`. A missing file means that stage has not
   started.
3. Determine the next gate: first unaccepted artifact in the chain (intent, then
   spec unless `risk: low`, then design.md and each artifact in its `requires:` unless
   `risk: low`, then plan). If the plan is accepted: build, review,
   release, in that order, by the files that exist.
4. Mark the entry named in `.sdlc/active` as active.
5. Print a table with columns: change, intent, spec, design (accepted of required, e.g. `3/5`, or `-`),
   plan, incident, risk, next gate.
6. Under the table, name the single most important action for the human (for
   example "review intent/003-search/plan.md and set status: accepted").
7. If `.sdlc/bypass.log` has entries, mention how many times the gate was bypassed.
8. If `testCommand` in the config is null, mention that the Stop hook cannot
   enforce tests.

## Gate
None. This skill never asks the human to accept anything.

## Commit
Nothing to commit. Do not create files.

## Don't
- Do not edit any file, including frontmatter.
- Do not set `status: accepted` or suggest that you will.
- Do not run build, test or deploy commands.
- Do not guess a status; if the frontmatter is missing, say so.

## Next
Whatever the next gate names (intent, spec, design, plan, build, review-pr, ship).

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
