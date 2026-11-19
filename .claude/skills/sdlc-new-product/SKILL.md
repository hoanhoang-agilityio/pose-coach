---
name: sdlc-new-product
description: Use right after installing ai-sdlc in an empty repository, to interview the human and draft the product intent, stack proposal and CLAUDE.md.
---

# sdlc-new-product

## Purpose
Start a new product through the chain. Interview the human, write
`intent/000-product/intent.md`, propose a stack, draft `CLAUDE.md`, and suggest
the first intents.

## Reads
- The human's answers.
- `.sdlc/config.json`, `.sdlc/policies/`, any existing `CLAUDE.md` text.

## Writes
- `intent/000-product/intent.md` (status draft).
- `CLAUDE.md` (draft; only adds to human content).
- A stack proposal inside the product intent (alternatives and trade-offs).
- A printed JSON change for `.sdlc/config.json` (`testCommand`/`lintCommand`)
  once a stack exists. The config is protected: you never edit it.
- `intent/000-product/grill.md`, then the product-level `design-system`, `architecture`
  and `infra-design` artifacts.
- Up to 3 suggested draft intents for the first features.

## Steps
0. Start with `grill-me` at product level (`intent/000-product/grill.md`): users,
   core flows, data, integrations, non-functional needs, risks, one question at a
   time. Open questions there block acceptance of the product intent.
1. Interview, one question at a time, each with a recommended answer (recommend-first
   rule, see `CLAUDE.md`; match `audience`): who the users are, the problem, what
   success looks like in 90 days, constraints (team, budget, compliance,
   hosting), and what is explicitly out of scope.
2. Write `intent/000-product/intent.md` from the intent template: What, Why,
   Constraints, Success metric, Out of scope. Set `risk: medium` unless the
   human says otherwise.
3. Recommend ONE stack with reason and trade-off for this team; mention an
   alternative only if the human asks or it is genuinely close. Flag database
   engine and cloud provider as **Hard to change later**. Put it in the intent under a "Stack proposal" heading. The
   human decides.
4. After the human accepts the intent and picks a stack, scaffold only what the
   plan allows. Until a plan is accepted, edits outside the allowlist stay
   blocked; so do not scaffold code yet.
5. Draft `CLAUDE.md`: product summary, chosen stack, commands (once known),
   conventions, and the rule that every change goes through `intent/`.
6. Once a stack and test runner exist and you have run them once, print the
   exact JSON change (`"testCommand": ...`, `"lintCommand": ...`) and ask the
   human to apply it to `.sdlc/config.json`. Never edit that file yourself.
7. Before the first feature, run `design-system`, `architecture` and
   `infra-design` for the product (stored under `docs/design-system/` and
   `intent/000-product/design/`); each needs human acceptance.
8. Suggest up to 3 first features as draft intents using the `intent` skill; the
   first is usually "project skeleton with a passing test".
9. Commit the intent, then `CLAUDE.md`.

## Gate
Tell the human: "Review `intent/000-product/intent.md`. When it is right, YOU
set `status: accepted`, `accepted_by` and `accepted_at`." Also ask them to
confirm the stack. Then run `plan` (risk low) or `spec`.

Accept by editing the frontmatter and committing it yourself (`docs(000-product): accept intent`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
On branch `feat/000-product` created from the default branch.
`docs(000-product): add intent` and `docs(000-product): draft CLAUDE.md`

## Don't
- Do not set `status: accepted`, `accepted_by` or `accepted_at`.
- Do not scaffold application code before a plan is accepted.
- Do not pick the stack silently; propose and ask.
- Do not overwrite human text in `CLAUDE.md`.
- Do not edit `.sdlc/config.json` (protected); propose the JSON instead.
- Do not propose `testCommand` before the command actually runs.
- Do not touch `.env*` or credentials.

## Next
After intent acceptance: `plan` (low) or `spec`, then the first feature intents.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
