---
name: intent
description: Use when the human brings an idea, ticket, bug report or alert and wants it turned into a reviewable intent before any design or code.
---

# intent

## Purpose
Turn a raw request into `intent/NNN-slug/intent.md`: what, why, constraints,
success metric, and a risk tier. This is the first human gate of the chain.

## Reads
- The human's words and any source link (ticket, alert, thread).
- `CLAUDE.md`, `docs/codebase-map.md` (if present) and `.sdlc/config.json` (for
  `sensitivePaths`).
- `intent/NNN-slug/grill.md` (or `intent/000-product/grill.md`) if it exists: carry its decisions into the intent; any open question in it blocks acceptance, so tell the human.
- Existing `intent/*/` directories to avoid duplicates and to pick the next number.

## Writes
- `intent/NNN-slug/intent.md` from `.claude/skills/intent/template.md`, with
  `status: draft`.

## Steps
1. List `intent/` and choose the next free three-digit number `NNN`. Pick a
   short kebab-case `slug`.
2. Create (or switch to) the change branch from the default branch (`defaultBranch` in
   `.sdlc/config.json`) before writing anything: `feat/NNN-slug`, or `fix/NNN-slug`
   when the source is an incident or bug. Every later stage commits on this branch,
   so one PR carries intent, spec, plan, code and review.
3. Search existing intents for duplicates. If one covers the same goal, tell the
   human and stop.
4. Ask at most 5 clarifying questions, one at a time, only about things you cannot infer: who
   is affected, why now, hard constraints, how success is measured, what is out
   of scope. Follow the recommend-first rule (see `CLAUDE.md`): one recommended answer with reason and trade-off, not a menu; match `audience` in `.sdlc/config.json`. If the request is very vague, offer the `grill-me` skill first.
5. Copy the template to `intent/NNN-slug/intent.md`. Fill `source:` with the
   link and `originator:` with who asked.
6. Write What, Why, Constraints, Success metric, Out of scope and Open
   questions. Keep it under one page. Describe outcomes, not implementation.
7. Propose a `risk:` value. `low`: docs, copy, additive behind a flag. `medium`:
   ordinary product change. `high`: auth, billing, CI, migrations. If the change
   touches anything in `sensitivePaths` the risk is at least `medium`. Explain
   the choice in one line under Open questions. You may not lower a risk the
   human set.
8. Keep `status: draft`, leave `accepted_by` and `accepted_at` empty.
9. Commit only this file, on the change branch.

## Gate
Tell the human: "Review `intent/NNN-slug/intent.md`. When it is right, YOU set
`status: accepted`, `accepted_by` and `accepted_at` in the frontmatter. I cannot
and will not set them." Then stop. The next skill is `spec` (medium/high risk)
or `plan` (low risk).

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept intent`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`docs(NNN-slug): intent <summary>` (for example `docs(004-export-csv): add intent`)

## Don't
- Do not set `status: accepted`, `accepted_by` or `accepted_at`; the hook blocks
  it and CI fails it.
- Do not write a spec, plan or code in the same turn.
- Do not edit an accepted intent; ask the human to set it back to `draft`.
- Do not invent a success metric the human did not give; put it under Open
  questions.
- Do not lower the risk tier.

## Next
After the human accepts: `spec` for medium/high risk, `plan` for low.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
