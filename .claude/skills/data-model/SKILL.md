---
name: data-model
description: Use when a change adds or alters stored data and needs an ER diagram, schema, indexes, migration and rollback plan before planning.
---

# data-model

## Purpose
Design the stored data: entities and relations, tables, columns, types and keys, indexes for the real query patterns, a safe migration and backfill with rollback, and PII, retention and access rules.

## When required
Required when the change adds or alters tables, collections, columns, indexes or stored files.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `data-model`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- Current schema and migrations (and `docs/data-model.md` if present).
- `design/backend.md`, `design/api.md`, `design/security.md` if present.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/data-model.md` from `.claude/skills/data-model/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `data-model` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Read the current schema and migration history; record the real table and column names touched.
4. Draw a Mermaid `erDiagram` of the entities in scope, marking new and changed ones.
5. Define each table: columns, types, nullability, defaults, primary and foreign keys, constraints. For an existing repo add a "diff vs current schema" section (added, changed, removed).
6. List the query patterns from the spec and design an index for each; say what each index costs on write.
7. Plan migration: ordered steps, backfill method and batch size, lock or downtime impact, how to run old and new code side by side (expand then contract), and the rollback. Any destructive or non-reversible step is **Hard to change later**.
8. Classify data: which columns are PII or sensitive, retention period, who may read or write, encryption needs. Pick the database engine only for a new product, as a recommendation with reason and trade-off.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/data-model.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept data-model`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add data-model design`

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
