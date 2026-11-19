---
name: architecture
description: Use when a change adds a component, service or integration and needs C4 diagrams, key-flow sequences, failure modes and ADRs before planning.
---

# architecture

## Purpose
Describe how the change fits the system: C4 context and container views, key flows as sequence diagrams, module boundaries, failure modes, and one ADR per significant decision.

## When required
Required when the change adds a new component, service or integration. `design` lists it in `requires:`; skip it for changes inside one existing module.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `architecture`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `docs/architecture.md`, `docs/codebase-map.md` and existing `docs/adr/*.md`.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/architecture.md` from `.claude/skills/architecture/template.md`, `status: draft`, same `risk:` as the spec.
- `docs/adr/NNNN-slug.md` from `.claude/skills/architecture/adr-template.md`: one ADR per significant decision (`status: draft`).

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `architecture` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Map the current system from `docs/architecture.md` and the code; list the real modules, stores and external services the change touches.
4. Draw the C4 context view (people, this system, external systems) and the container view (apps, services, data stores, queues) in Mermaid. Mark what is new.
5. Draw a Mermaid `sequenceDiagram` for each key flow from the acceptance criteria, including one failure path each. Add `stateDiagram-v2` or `classDiagram` only where state or structure is the hard part.
6. Define module boundaries: what each module owns, what it may call, what it must never call.
7. List failure modes: dependency down, slow, duplicate or out-of-order messages, partial writes; for each give the behavior and the recovery.
8. For every significant decision (new service, sync vs async, build vs buy, data store, protocol) write an ADR in `docs/adr/NNNN-slug.md` (next free number): context, decision, consequences, alternatives rejected. Recommend one option with a reason; flag hard-to-reverse ones as **Hard to change later**.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/architecture.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept architecture`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add architecture design`

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
