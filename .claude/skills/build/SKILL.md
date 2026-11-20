---
name: build
description: Use when the plan is accepted (or trivial) and the human wants the change implemented, tests first, with evidence it works.
---

# build

## Purpose
Implement the plan on branch `feat/NNN-slug` (`fix/NNN-slug`), tests first, and prove it works with real evidence.

## Reads
- `plan.md`, `spec.md`, `design/*`, `features.json` and `progress.md` if present.
- `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`testCommand`, `lintCommand`).

## Writes
- Code and tests listed in the plan; `.sdlc/active` containing `NNN-slug`.
- `intent/NNN-slug/progress.md`: what was done, what is next, how to run it. Update it as you go.
- `features.json`: only the `passes` field.

## Steps
1. Session start: read `progress.md`, `git log`, `features.json`; run the tests. Fix anything already broken first.
2. Confirm `plan.md` is accepted (trivial: skip). Be on the change branch, never the default. Write `NNN-slug` to `.sdlc/active`.
3. One feature (or plan step) at a time: write the failing test, see it fail, write the code, run `testCommand` until green, commit, update `progress.md`.
4. Set `passes: true` only with evidence: test output, a screenshot or command output. Test end-to-end as a real user would, driving the real app, not only unit tests.
5. If the plan or design is wrong, stop, note it in `progress.md` and ask the human to reopen it (`status: draft`). Don't work around it. Log files outside the plan under Deviations.
6. Before the PR run `testCommand`, `lintCommand` and the project build. The Stop hook blocks finishing while tests or lint fail (3 tries, then it hands back to you).
7. Start a fresh-context subagent that sees only the diff, `plan.md`, `CLAUDE.md`, `REVIEW.md`. It reports bugs, missed plan items and rule violations. Fix real ones and record the outcome in `progress.md`.
8. Commit in small steps, then stop. No push or PR here.

## Gate
None. Tell the human checks are green and point to `progress.md`.

## Don't
- No code without an accepted plan (hook blocks it; trivial excepted).
- Don't edit accepted artifacts, weaken or delete tests, use `--no-verify`, force push or push to the default branch.
- Don't set `status: accepted`; don't write `.env*`, keys or credentials.
- Don't mark `passes` without evidence.

## Next
`review-pr`.
