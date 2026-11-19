---
name: design
description: Use when a spec is accepted and the change is medium or high risk, to decide which design disciplines are needed and coordinate them before planning.
---

# design

## Purpose
Orchestrate the design stage. Read the accepted spec, propose which discipline
skills this change needs, record cross-cutting decisions, and link the
artifacts. It writes `design/design.md`; the discipline skills write the rest.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `intent.md`.
- `intent/NNN-slug/grill.md`: decisions carry into `design.md`; any open
  question blocks acceptance (tell the human).
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`,
  `sensitivePaths`), `docs/` (architecture, data model, API, design system).

## Writes
- `intent/NNN-slug/design/design.md` from `.claude/skills/design/template.md`,
  `status: draft`, same `risk:` as the spec, with `requires: [ ... ]`.

## Steps
1. Confirm `spec.md` is accepted. If the intent has `risk: low`, tell the human
   design is skipped and go to `plan`; stop. Writing under `design/` is
   blocked until the spec is accepted.
2. Read `grill.md` and list its open questions. Carry its decisions over.
3. Propose the `requires:` list from the spec, following the recommend-first
   rule: one recommended list, each entry with a one-line reason, default
   accept ("ok"). Disciplines: `architecture` (new component, service or
   integration), `prototype` (user-facing UI), `design-system` (UI tokens
   missing or changing), `frontend-design` (UI), `api-design` (API or event
   contract), `backend-design` (server logic), `data-model` (stored data),
   `infra-design` (infra, pipeline, secrets, deploy), `security-design`,
   `test-strategy`, `observability-design` (production behavior).
4. Apply the fixed rules: if the change touches any `sensitivePaths`,
   `security-design` is always required; `test-strategy` is always required for
   medium and high risk. Do not drop them even if asked; explain why.
5. Write `design.md`: the `requires:` list (inline `[a, b]` or block `- a`
   form), a table of each discipline and its reason, and cross-cutting
   decisions (shared choices such as auth model, error shape, ordering of
   work), each with reason and trade-off. Flag hard-to-reverse ones as
   **Hard to change later**.
6. Tell the human they may edit `requires:` before accepting; the gate hook
   reads that list.
7. Run the listed discipline skills in a sensible order (usually
   `design-system`, `architecture`, `data-model`, `api-design`,
   `backend-design`, `frontend-design`, `prototype`, `security-design`,
   `infra-design`, `observability-design`, `test-strategy`), one at a time,
   linking each artifact in `design.md` as it is written.
8. Commit only the files written in each step.

## Gate
Tell the human: "Review `intent/NNN-slug/design/design.md` and edit `requires:`
if needed. YOU set `status: accepted`, `accepted_by` and `accepted_at` on
`design.md` and on every required artifact." Stop. `plan.md` stays blocked until
`design.md` and every artifact in `requires:` are accepted (the block message
lists what is missing).

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept design`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add design`

Commit on the change branch `feat/NNN-slug` (`fix/NNN-slug`), the same one every stage uses.

## Don't
- Do not set `status: accepted`, `accepted_by` or `accepted_at`.
- Do not skip `security-design` for `sensitivePaths` or `test-strategy` for medium/high.
- Do not edit an accepted artifact; ask the human to reopen it as `draft`.
- Do not write a file-by-file plan or code; that is `plan` and `build`.
- Do not present a menu of options; recommend one.
- Do not leave grill open questions unflagged.

## Next
When `design.md` and all required artifacts are accepted: `plan`.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
