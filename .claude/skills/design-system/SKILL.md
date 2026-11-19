---
name: design-system
description: Use once per product (then as its own change) to define design tokens, the component inventory and accessibility rules the UI work must follow.
---

# design-system

## Purpose
Define the visual language once: tokens, component inventory with states, and accessibility rules. UI skills (`prototype`, `frontend-design`, `build`) follow it.

## When required
Once per product, before the first UI feature (`sdlc-new-product` runs it). After that, changes to it are their own change with their own intent. `design` lists it in `requires:` when UI work needs tokens that do not exist yet.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md`, when working inside a change.
- `intent/*/grill.md` (product-level `intent/000-product/grill.md` first): decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- Existing styles, theme files, component library and `docs/design-system/` if present (existing repos).
- Brand material the human provides.
- Existing code and docs the change touches (read only).

## Writes
- `docs/design-system/design-system.md` from `.claude/skills/design-system/template.md`, `status: draft`, same `risk:` as the spec.
- `docs/design-system/tokens.json` (color, type, spacing, radius, motion), `docs/design-system/components.md` (inventory and states).

## Steps
1. If working inside a change, confirm `spec.md` is accepted; otherwise stop and name the file the human must review. Tell the human which change or product this design system serves.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Inspect what exists: theme files, CSS variables, component folders. For an existing product, record the real values rather than inventing new ones.
4. Recommend a design direction in plain language (look and feel, density, tone) with reason and trade-off; the human answers "ok" or changes it.
5. Write `tokens.json` with groups `color` (incl. semantic roles: background, text, primary, danger), `type` (families, scale, line heights), `spacing`, `radius`, `motion` (durations, easing, reduced-motion rule). Every color pair used for text must meet WCAG AA contrast; record the ratio.
6. Write `components.md`: each component with purpose, variants, and all states (default, hover, focus, active, disabled, loading, error, empty).
7. In `design-system.md` write the accessibility rules: contrast, visible focus, full keyboard operation, target size, reduced motion, form labels and errors.
8. Record decisions with reasons (framework, token naming, light/dark). Flag hard-to-reverse ones as **Hard to change later**.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `docs/design-system/design-system.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted (when `design.md` requires it).

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept design-system`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add design-system design`

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
