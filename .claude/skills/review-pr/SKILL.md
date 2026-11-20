---
name: review-pr
description: Use when a build is finished and the branch needs a layered agent review and a pull request ready for human approval.
---

# review-pr

## Purpose
Layered review of `feat/NNN-slug` (or `fix/`), recorded in `review.md`, inline PR comments, and the PR. Claude reviews; humans approve and merge.

## Reads
- The diff against the default branch.
- `intent/NNN-slug/{spec,plan,progress}.md`, `design/design.md`, `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`.
- `.sdlc/config.json` (risk, `sensitivePaths`), `.github/pull_request_template.md`, `evals/review-cases/*.md` (past misses).

## Writes
- `intent/NNN-slug/review.md` from `.claude/skills/review-pr/review-template.md`.
- Inline PR comments and the PR (body from the template).

## Steps
1. Confirm tests and lint pass and `progress.md` exists. Work out the round number (max 3).
2. Finders: launch 4 to 5 parallel subagents (`model: sonnet`), one angle each: (a) spec coverage against requirements and acceptance criteria, (b) correctness and edge cases, (c) rules in `CLAUDE.md`, `REVIEW.md`, policies, (d) performance, (e) design conformance against `design/design.md` (skip when there is no design). Each returns findings with file:line and evidence.
3. Report only gaps that affect correctness or a stated requirement. Style preferences are not findings. Don't chase every finding.
4. Verifiers: for each finding launch 3 subagents (`model: haiku`) that try to disprove it. Keep it only if at least 2 of 3 agree it is real.
5. Tag survivors exactly one of **Important** (must fix), **Nit** (optional), **Pre-existing**. Write them to `review.md` and post inline comments.
6. Run `/security-review` separately; an open security finding blocks merge.
7. Rounds: max 3; after round 2 review only the new diff; never repeat a posted finding, link it.
8. Important findings: stop and report; `build` fixes them, then the next round.
9. When clean, push the branch (never the default) and open the PR from the template with `intent/NNN-slug`, the risk and the required approvals (trivial/low 1, medium 1, high 2 via CODEOWNERS; `sensitivePaths` means high). Commit `review.md`.

## Gate
Tell the human which PR to review and how many approvals the tier needs. An agent's approval never counts; a human approves and merges.

## Don't
- Never approve, merge (`gh pr merge`), force push or use `--no-verify`.
- Never exceed 3 rounds, lower the risk tier, set `status: accepted` or skip `/security-review`.

## Next
After a human merge: `ship`.
