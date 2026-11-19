---
name: frontend-design
description: Use when a change touches the user interface and needs a screen map, component tree, state, data fetching, forms and performance budget decided before planning.
---

# frontend-design

## Purpose
Decide how the UI is built: screens and routes, component tree, state management, data fetching and caching, forms, error/empty/loading states, accessibility, i18n and a performance budget.

## When required
Required when the change adds or reshapes UI beyond a copy tweak. Usually listed together with `prototype`.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `frontend-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `docs/design-system/` (tokens, components), `design/prototype.md`, `design/api.md` if present.
- The existing frontend code and its conventions.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/frontend.md` from `.claude/skills/frontend-design/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `frontend-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Find the existing frontend conventions (framework, routing, state, styling, test style) and follow them unless a decision says otherwise.
4. Write the route and screen map, linked to the prototype screens.
5. Draw the component tree; mark which components are reused from the design system and which are new.
6. Decide state management (local, shared, server cache) per piece of state, and data fetching and caching (when to fetch, cache keys, invalidation, optimistic updates).
7. Specify forms and validation (fields, rules, messages, when errors show) and the error, empty and loading state for every screen.
8. Set accessibility (focus order, labels, announcements), i18n (strings, formats, RTL if relevant) and a performance budget (bundle size, LCP, interaction time).
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/frontend.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept frontend-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add frontend-design design`

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
