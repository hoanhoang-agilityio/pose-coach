---
name: build
description: Use when plan.md is accepted and the human wants the change implemented on a branch, tests first, until tests and lint are green.
---

# build

## Purpose
Implement an accepted plan on branch `feat/NNN-slug` (`fix/NNN-slug` for incident or bug fixes), tests first, and prove it
is ready for review with a pre-PR check and a fresh-context self-review.

## Reads
- `intent/NNN-slug/plan.md` (must be accepted), plus `spec.md`/`intent.md` for
  context.
- `intent/NNN-slug/design/*` (accepted): `docs/design-system/tokens.json`, `design/openapi.yaml`, `design/data-model.md`, `design/test-strategy.md`, `design/security.md`.
- `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`.
- `.sdlc/config.json` for `testCommand` and `lintCommand`.

## Writes
- Code and tests listed in the plan, on branch `feat/NNN-slug` (`fix/NNN-slug` for incident or bug fixes).
- `.sdlc/active` containing `NNN-slug`.
- `intent/NNN-slug/build-log.md` from `.claude/skills/build/build-log-template.md`.

## Steps
1. Verify `plan.md` has `status: accepted`. If not, stop and name the file to
   review.
2. Switch to the change branch (`feat/NNN-slug`, or `fix/NNN-slug` for incident or
   bug fixes) that the earlier stages used. Never work on the default branch.
3. Write `NNN-slug` into `.sdlc/active`. This lifts the code gate for this
   change only.
4. Create `build-log.md`. Record progress there; `plan.md` is frozen and must
   not be edited.
5. For each plan step: write the failing test first, run it and see it fail,
   write the code, run `testCommand` until green, tick the step in
   `build-log.md`.
6. If the plan is wrong or incomplete, stop. Record why in `build-log.md` and
   ask the human to reopen `plan.md` (set it to `draft`). Do not work around it.
7. Follow the design: use the design-system tokens (no hard-coded colors or
   spacing), implement the OpenAPI contract exactly (paths, schemas, error shape),
   write migrations as in `data-model.md` (including rollback), and write the tests
   named in `test-strategy.md`. If code and design disagree, stop and ask the
   human to reopen the design artifact; do not drift silently.
8. Keep to the files in the plan. If you must touch another file, log it under
   Deviations and tell the human.
9. Pre-PR layer, run all of: `testCommand`, `lintCommand`, and the project build
   if there is one. Fix failures; the Stop hook also blocks you from finishing
   while tests or lint fail (3 attempts, then it hands back to the human).
10. Start a fresh-context subagent (Agent tool) that sees only the diff,
   `plan.md`, `CLAUDE.md` and `REVIEW.md`. Ask it to report bugs, missed plan
   items and rule violations. Fix valid findings, re-run checks, and record the
   outcome under Pre-PR checks.
11. Commit in small steps, then stop. Do not push or open a PR here.

## Gate
Tell the human: build is done and checks are green, see
`intent/NNN-slug/build-log.md`; the next skill is `review-pr`. A human decides
when to proceed.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept build`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`feat(NNN-slug): <summary>` for code, `fix(NNN-slug): ...` for fixes, `test(...)`, `refactor(...)`,
`chore(...)` as appropriate; `docs(NNN-slug): build log <summary>` for build-log.md.

## Don't
- Do not start without an accepted plan (the hook blocks code edits).
- Do not edit `plan.md`, `spec.md` or `intent.md` once accepted.
- Do not use `--no-verify`, force push, or push to the default branch.
- Do not weaken or delete tests to get green.
- Do not set `status: accepted` anywhere.
- Do not write to `.env*`, keys or credentials.

## Next
`review-pr`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
