---
name: test-strategy
description: Use when a medium or high risk change needs every acceptance criterion mapped to a test level, plus test data, performance checks and evals, before planning.
---

# test-strategy

## Purpose
Decide how the change will be proven: the test pyramid for this change, each acceptance criterion mapped to unit, integration, contract or e2e tests, test data, performance and load checks, evals for AI features, and what stays manual.

## When required
Always required for medium and high risk changes.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `test-strategy`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- The accepted spec acceptance criteria.
- Existing tests, test helpers, fixtures and `testCommand` in `.sdlc/config.json`.
- Other `design/*.md` files that exist (api, data-model, frontend, security).
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/test-strategy.md` from `.claude/skills/test-strategy/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `test-strategy` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Read the existing test layout, frameworks and helpers; follow them.
4. Set the pyramid for this change: how many unit, integration, contract and e2e tests, with the reason for each level.
5. Map every acceptance criterion to at least one test: level, file path to create, and the one-line behavior. A criterion with no automatable test goes under Manual, with the reason.
6. Add contract tests against `design/openapi.yaml` when an API exists, and migration tests (up, down, backfill) when `design/data-model.md` exists.
7. Define test data: fixtures, factories, anonymization of real data, cleanup.
8. Set performance and load checks (target, tool, pass bar) and, for AI features, evals: cases, scoring, pass threshold, and how regressions are caught.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/test-strategy.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept test-strategy`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add test-strategy design`

Commit on the change branch `feat/NNN-slug` (`fix/NNN-slug`), the same one every stage uses.

## Don't
- Do not set `status: accepted`, `accepted_by` or `accepted_at`.
- Do not edit an accepted artifact; ask the human to reopen it as `draft`.
- Do not write application code or the plan; that is `plan` and `build`.
- Do not present a menu of options; recommend one (alternatives only if asked).
- Do not leave open questions unflagged.
- Do not edit protected files (hooks, `.claude/settings*.json`, `.sdlc/config.json`, CI workflow); propose changes.

## Next
Back to `design` to check the remaining required artifacts; when all are accepted, `plan`.

If anything above cannot be done (missing file, unaccepted artifact, failing command), stop and tell the human exactly what is missing instead of guessing.
