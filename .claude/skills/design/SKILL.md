---
name: design
description: Use when a medium or high risk spec is accepted, to write one design.md covering only the areas that apply, before planning.
---

# design

## Purpose
Write ONE `intent/NNN-slug/design/design.md`. Not for trivial or low risk.

## Reads
- Accepted `spec.md`, `grill.md`, `CLAUDE.md`, `REVIEW.md`, `.sdlc/policies/*.md`, `.sdlc/config.json`.
- The code the change touches (read only).

## Writes
- `design/design.md` (`status: draft`, same `risk`). Add a section only if it applies; delete the rest.
- Optional ADRs in `docs/adr/NNNN-slug.md` for big decisions.

## Checklist (answer 2-3 questions per area, briefly)
- `## Architecture`: which components and boundaries change? What fails, and how is it handled?
- `## Data`: what is stored, with what shape and migration? Can it be rolled back?
- `## API and contracts`: which endpoints or events, with errors and versioning?
- `## UI and design system`: which screens and states? Which existing components and tokens? (Use `prototype` for clickable screens.)
- `## Infra and deploy`: new environments, secrets, rollout and rollback?
- `## Security`: REQUIRED for high risk (which includes any `sensitivePaths`). Who can do what, what input is untrusted, what personal data, which controls?
- `## Observability`: what signal shows the success metric broke?
- `## Test strategy`: REQUIRED for medium/high. Map each acceptance criterion to a test level (unit, integration, end-to-end) plus test data.
- `## Decisions`: each choice with reason; flag **Hard to change later**.

## Steps
1. Confirm the spec is accepted; if not, stop and name it.
2. Read the code; use real paths and reuse existing patterns.
3. Fill the applicable sections; ask the human only about real choices (recommend-first: one answer, reason, trade-off).
4. If UI is involved, offer `prototype`.
5. Commit only design files.

## Gate
Human accepts the design (`/accept design` on the PR, or the local accept command). Accepting covers every draft `.md` under `design/` (prototype included). Claude never sets `status: accepted`.

## Don't
- Don't write headings that do not apply, or how-to essays.
- Don't use other heading names for Security or Test strategy; the gate checks them exactly.
- Don't edit accepted files; no code here.

## Next
`plan`.
