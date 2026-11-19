---
name: prototype
description: Use when a change has user-facing UI and needs a clickable HTML prototype of the key screens and flows mapped to acceptance criteria.
---

# prototype

## Purpose
Let the human click through the key screens and flows before any code exists. A single HTML file with mock data and no backend, styled with the design-system tokens, mapped to the acceptance criteria.

## When required
Required for any user-facing UI change. Skip for backend-only changes.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `prototype`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `docs/design-system/tokens.json` and `components.md` (the prototype must use these tokens).
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/prototype.md` from `.claude/skills/prototype/template.md`, `status: draft`, same `risk:` as the spec.
- `intent/NNN-slug/design/prototype/index.html`: a clickable single-file HTML prototype (inline CSS and JS, mock data, no backend).

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `prototype` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. List the screens and flows the acceptance criteria need; keep only key ones (happy path, one error, empty and loading states).
4. Read `docs/design-system/tokens.json`. If it does not exist, stop and tell the human to run `design-system` first (or accept that the prototype uses neutral defaults, recorded as a decision).
5. Write `design/prototype/index.html`: one file, inline CSS with the tokens declared as CSS variables on `:root`, inline JS for navigation between screens, hard-coded mock data, no network calls, no external dependencies.
6. Keep it accessible: visible focus, keyboard navigation, contrast per the design-system rules, semantic elements.
7. Write `design/prototype.md`: a table mapping each flow and screen to the acceptance criteria it demonstrates, the mock data used, and what the prototype deliberately does not cover.
8. If an Artifact tool for claude.ai is available, publish `index.html` as a private artifact and put the link in `prototype.md`. If a Figma connector is available, offer once to push the screens to Figma; do it only if the human says yes.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/prototype.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept prototype`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add prototype design`

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
