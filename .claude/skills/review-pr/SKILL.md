---
name: review-pr
description: Use when a build is finished and the branch needs a layered agent review and a pull request ready for human approval.
---

# review-pr

## Purpose
Run a layered review of branch `feat/NNN-slug` (or `fix/NNN-slug`), record it in `review.md`, post
inline comments, and open the PR. Claude reviews; humans approve and merge.

## Reads
- The diff against the default branch.
- `intent/NNN-slug/{intent,spec,plan,build-log}.md` and `design/*` (openapi, data-model, security, architecture, tokens), `CLAUDE.md`, `REVIEW.md`,
  `.sdlc/policies/*.md`.
- `.sdlc/config.json` (risk, `sensitivePaths`) and
  `.github/pull_request_template.md`.
- `evals/review-cases/*.md` as examples of past misses.

## Writes
- `intent/NNN-slug/review.md` from `.claude/skills/review-pr/review-template.md`.
- Inline PR comments, and the PR itself with a body from the PR template.

## Steps
1. Confirm tests and lint pass and `build-log.md` exists. Work out the round
   number (max 3).
2. Layer 1, finders. Launch 4 to 5 parallel subagents with the Agent tool,
   `model: sonnet`, one angle each: (a) spec coverage against requirements and
   acceptance criteria, (b) correctness and edge cases, (c) rules in
   `CLAUDE.md`, `REVIEW.md` and policies, (d) performance, (e) design conformance: the diff against `design/openapi.yaml` (the API contract), `design/data-model.md` (schema and migrations), `docs/design-system/tokens.json` (no hard-coded values), `design/architecture.md` (module boundaries) and `design/security.md` (controls). Skip (e) only when the change has no `design/` folder. Each returns findings
   with file:line and evidence.
3. Layer 2, verifiers. For every finding launch 3 Agent subagents with `model:
   haiku` that independently try to disprove it. Keep a finding only if at least
   2 of 3 agree it is real. Drop style-only findings.
4. Layer 3, tag each survivor exactly one of **Important** (must fix), **Nit**
   (optional), **Pre-existing** (not introduced by this diff). Write them in
   `review.md` and post inline comments.
5. Layer 4, run `/security-review` separately. Any open security finding blocks
   merge; record it in `review.md`.
6. Round rules: at most 3 rounds. After round 2 review only the new diff since
   the last round. Never repeat a finding already posted; link the earlier
   comment instead.
7. If there are Important findings, stop and report; the human or `build` fixes
   them, then run the next round.
8. When clean, push the branch (never the default branch) and open the PR using
   `.github/pull_request_template.md`. The body must contain the reference
   `intent/NNN-slug`, the risk tier, and the required approvals: low 1 (the
   person who prompted Claude counts), medium 1, high 2 via CODEOWNERS. Touching
   `sensitivePaths` raises risk to at least medium.
9. Commit `review.md`.

## Gate
Tell the human which PR to review and how many human approvals the tier needs.
An agent's approval never counts. A human approves and merges.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept review`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`docs(NNN-slug): review <summary>`

Commit on the change branch `feat/NNN-slug` (`fix/NNN-slug`), the same one every stage uses, so one PR carries intent, spec, plan, code and review.

## Don't
- Never approve the PR, request merge, run `gh pr merge`, or merge locally.
- Never force push or use `--no-verify`.
- Never exceed 3 rounds or repeat a posted finding.
- Never lower the risk tier or set `status: accepted`.
- Never skip the `/security-review` pass.

## Next
After human approvals and a human merge: `ship`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
