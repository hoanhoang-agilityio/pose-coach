---
name: spec
description: Use when the human brings an idea, ticket, bug or alert, to write one spec.md (intent, requirements, acceptance criteria) and set the risk.
---

# spec

## Purpose
Turn an idea into ONE `spec.md`: the problem, testable requirements, acceptance criteria and an end-to-end check. It also sets `risk`, which decides the gates.

## Reads
- The human's words, `intent/NNN-slug/grill.md` if present (carry its decisions; open questions block acceptance).
- `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`sensitivePaths`, `audience`).
- The code the change will touch (read only).

## Writes
- `intent/NNN-slug/spec.md` from `.claude/skills/spec/template.md`, `status: draft`.
- Creates branch `feat/NNN-slug` (`fix/NNN-slug` for bugs) from the default branch; next free `NNN`.

## Steps
1. If requirements are vague, offer `grill-me` first. Otherwise ask only what you cannot find in the code or docs, one question at a time (recommend-first).
2. Pick `risk` and tell the human why:
   - trivial: describable in one sentence, at most 3 files, no `sensitivePaths`.
   - low: small change, no `sensitivePaths`.
   - medium: a new feature.
   - high: personal data, auth, payments, or any `sensitivePaths`.
3. trivial: skip the spec; go to `plan` (a few lines). low: the spec is optional; short is fine.
4. Write Requirements and Acceptance criteria. Every criterion must be testable; no "fast" or "easy".
5. Write the End-to-end verification step: how a person (or you, driving the real app) proves it works.
6. Apply relevant policy rules; raise conflicts instead of choosing silently. Never lower risk.
7. Commit only the spec.

## Gate
medium/high: human accepts the spec (comment `/accept spec` on the PR, or `npx github:hoanhoang-agilityio/ai-sdlc accept spec`). low: spec needs no acceptance. Claude never sets `status: accepted`.

## Don't
- No design detail or code here; that is `design` and `build`.
- Don't edit an accepted spec; ask the human to set `draft`.

## Next
medium/high: `design`. low/trivial: `plan`.
