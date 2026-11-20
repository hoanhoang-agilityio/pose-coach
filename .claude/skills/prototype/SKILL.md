---
name: prototype
description: Use when a change has user-facing UI and needs a clickable HTML prototype of the key screens mapped to acceptance criteria.
---

# prototype

## Purpose
Let the human click through key screens before code exists: one HTML file, mock data, no backend.

## Reads
- Accepted `spec.md`, `design/design.md`, `grill.md`, `CLAUDE.md`, `.sdlc/config.json` (`audience`).
- Existing UI code or styles, to match them (read only).

## Writes
- `design/prototype/index.html` (inline CSS and JS, mock data, no network calls).
- A `## Prototype` section in `design/design.md`: table mapping each screen or flow to the acceptance criteria it shows, mock data, and what it does not cover. No separate `prototype.md`.

## Steps
1. Confirm the spec is accepted. List the screens the acceptance criteria need: happy path, one error, empty and loading states.
2. Write `index.html` with design tokens as CSS variables on `:root` (reuse the project's if any). Keep it keyboard-accessible with visible focus and semantic elements.
3. Add the `## Prototype` section to `design.md`.
4. If an Artifact tool is available, publish it as a private artifact and link it. Offer Figma only if a connector exists.
5. Commit the files this skill wrote.

## Gate
Accepted together with the design (`/accept design`); no separate acceptance.

## Don't
- No application code; don't set `status: accepted`; don't edit accepted files.
- Don't present menus; recommend one answer.

## Next
`plan`.
