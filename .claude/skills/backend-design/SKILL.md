---
name: backend-design
description: Use when a change adds server-side logic and needs modules, domain model, business rules, transactions, jobs and error handling decided before planning.
---

# backend-design

## Purpose
Decide how the server side works: modules and services, the domain model, business rules, transactions and consistency, background jobs, caching, error and retry behavior, and concurrency.

## When required
Required when the change adds or changes business logic, background jobs or service structure.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `backend-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `design/api.md`, `design/data-model.md`, `design/architecture.md` if present.
- The existing backend code, layering rules and error-handling style.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/backend.md` from `.claude/skills/backend-design/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `backend-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Read the existing backend layout and conventions; list the modules the change touches by real path.
4. Define modules and services: responsibility, public interface, dependencies. Keep dependencies pointing one way.
5. Draw the domain model as a Mermaid `classDiagram` (entities, value objects, relations) and write each business rule as a numbered, testable statement.
6. Decide transaction boundaries and consistency: what must be atomic, what may be eventually consistent, and how conflicts are resolved.
7. Design jobs and queues (trigger, payload, idempotency, retry and dead-letter policy) and caching (what, key, TTL, invalidation).
8. Specify errors and retries (which errors retry, backoff, what the caller sees) and concurrency (locking or optimistic versioning, ordering guarantees).
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/backend.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept backend-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add backend-design design`

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
