---
name: plan
description: Use when the spec and design are accepted (or the change is low or trivial risk), to list files, ordered steps, test plan and rollback before code.
---

# plan

## Purpose
Write `plan.md`: which files change, in what order, how it is tested, how to undo it. Code stays blocked until it is accepted (trivial excepted).

## Reads
- `spec.md` and `design/design.md` (accepted when required), `.sdlc/policies/*.md`, `CLAUDE.md`, `REVIEW.md`.
- The code and tests that will change; `.sdlc/config.json` (`testCommand`, `lintCommand`, `sensitivePaths`).

## Writes
- `intent/NNN-slug/plan.md` from `.claude/skills/plan/template.md`, `status: draft`, same `risk`.
- More than ~5 features: also `intent/NNN-slug/features.json`: `[{"id","description","steps":[...],"passes":false}]`. Later, `build` may change only `passes`.

## Steps
1. Medium/high: confirm `spec.md` and `design/design.md` are accepted; the hook blocks `plan.md` otherwise (design accept covers all files under `design/`). Low: no prerequisite.
2. Read the code; use real paths. Any `sensitivePaths` file means `risk: high`. Effective risk is the highest of `spec.md` and `plan.md`, so a trivial plan cannot downgrade a medium/high spec (never lower it).
3. Fill Files, ordered Steps (small, separately committable, tests first), Test plan, Rollback.
4. trivial: a few lines is enough and the plan needs no acceptance; CI caps it at 3 files. If it grows, raise the risk and write a spec.
5. Commit only the plan (and `features.json`).

## Gate
trivial: none. low and above: human accepts the plan (`/accept plan` on the PR, or `npx github:hoanhoang-agilityio/ai-sdlc accept plan`). Claude never sets `status: accepted`.

## Don't
- No code or tests during planning; don't skip Rollback.
- Don't edit an accepted plan; progress goes in `progress.md`.

## Next
`build`.
