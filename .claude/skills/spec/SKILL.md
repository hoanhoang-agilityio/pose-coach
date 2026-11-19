---
name: spec
description: Use when an intent is accepted and its risk is medium or high, to write the requirements, design and acceptance criteria before planning.
---

# spec

## Purpose
Convert an accepted intent into `spec.md`: testable requirements, a design, and
acceptance criteria. Skipped when the intent has `risk: low`.

## Reads
- `intent/NNN-slug/intent.md` (must be `status: accepted`).
- `intent/NNN-slug/grill.md` if it exists: carry its decisions into the spec; any open question in it blocks acceptance, so tell the human.
- `CLAUDE.md`, `docs/codebase-map.md`, `REVIEW.md`.
- Every file in `.sdlc/policies/*.md` (project rules the design must respect).
- The code areas the change will touch (read only).

## Writes
- `intent/NNN-slug/spec.md` from `.claude/skills/spec/template.md`, `status:
  draft`, same `risk:` as the intent.

## Steps
1. Open the intent and confirm `status: accepted`. If it is not, stop and tell
   the human which file to review.
2. If the intent has `risk: low`, tell the human to go straight to `plan` and stop.
3. Read all of `.sdlc/policies/*.md`. Note each rule that applies.
4. Explore the code that will change. Record real file paths and existing
   patterns to reuse.
5. Write Requirements as numbered, testable statements. Each must be falsifiable.
6. Write Design: approach, components, data and API changes, and one alternative
   you rejected with the reason. Detailed design belongs to the `design` stage.
   Follow the recommend-first rule (see `CLAUDE.md`): one recommended answer with reason and trade-off, not a menu; match `audience` in `.sdlc/config.json`. Record each choice as a decision with its reason.
7. Fill "Policies applied" with each relevant policy rule and how the design
   meets it. If a policy conflicts with the intent, raise it under Risks instead
   of choosing silently.
8. Write Acceptance criteria as checkboxes, each mapping to at least one future
   test.
9. Check the touched paths against `sensitivePaths` in `.sdlc/config.json`; if
   any match, the risk is at least `medium`. Never lower the intent's risk.
10. Commit only `spec.md`.

## Gate
Tell the human: "Review `intent/NNN-slug/spec.md`. When it is right, YOU set
`status: accepted`, `accepted_by` and `accepted_at`." Stop. The next skill is
`design` (medium/high risk), then `plan`.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept spec`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
`docs(NNN-slug): spec <summary>` (for example `docs(004-export-csv): add spec`)

Commit on the change branch `feat/NNN-slug` (`fix/NNN-slug`), the same one every stage uses, so one PR carries intent, spec, plan, code and review.

## Don't
- Do not write a spec if `intent.md` is not accepted (the hook blocks it).
- Do not set `status: accepted`, `accepted_by` or `accepted_at`.
- Do not edit an accepted spec; ask the human to reopen it as `draft`.
- Do not write code or a file-by-file plan; that is the `plan` skill.
- Do not ignore `.sdlc/policies/`; reading it is mandatory.
- Do not add requirements the intent does not justify.

## Next
After the human accepts the spec: `design` (medium/high risk), then `plan`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
