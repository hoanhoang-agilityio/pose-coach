---
name: api-design
description: Use when a change adds or changes an API or event contract and needs endpoints, schemas, errors, auth, versioning and an OpenAPI file agreed before planning.
---

# api-design

## Purpose
Fix the contract between systems before code: resources and endpoints, schemas, status and error codes, authentication and scopes, pagination, idempotency, rate limits, versioning and examples. Build and review check the code against it.

## When required
Required when the change adds or changes a public or internal API, or an event/message contract.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `api-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- Existing API definitions (`openapi.yaml`, GraphQL schema, AsyncAPI, route files) and `docs/api.md`.
- `design/data-model.md` and `design/security.md` if present.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/api.md` from `.claude/skills/api-design/template.md`, `status: draft`, same `risk:` as the spec.
- `intent/NNN-slug/design/openapi.yaml` (or a GraphQL schema, or AsyncAPI for events) from `.claude/skills/api-design/openapi-template.yaml`.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `api-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Find the existing API style (REST, GraphQL, events), naming, error shape and auth; follow it unless a decision says otherwise.
4. List resources and endpoints (or queries, mutations, topics) from the acceptance criteria. Name each with method, path and purpose.
5. Write the contract file: `openapi.yaml` for REST, a schema for GraphQL, AsyncAPI for events. Include request and response schemas, status codes and one error shape reused everywhere.
6. Specify authentication and scopes per endpoint, pagination and filtering, idempotency keys for unsafe retries, and rate limits.
7. State versioning and backward compatibility: what is additive, what breaks, and the deprecation path. A change to a public contract is **Hard to change later**; flag it.
8. Add request and response examples for the main flow and for each error, and validate the file parses (for example with the project's OpenAPI linter if one exists).
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/api.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept api-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add api-design design`

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
