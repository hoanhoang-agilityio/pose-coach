---
name: grill-me
description: Use when requirements are vague or a stage needs sharper answers, to interview the human one question at a time and log decisions for the spec.
---

# grill-me

## Purpose
Interview the human about ONE target (users, core flows, data, UI, integrations, risks, the whole product) until every answer is concrete. Decisions feed `spec.md`.

## Reads
- The human's words, `CLAUDE.md`, `.sdlc/config.json` (`audience`).
- An existing `spec.md` or earlier `grill.md` for the same scope.

## Writes
- `intent/NNN-slug/grill.md` from `.claude/skills/grill-me/template.md` (`intent/000-product/grill.md` for the product).

## Steps
1. Pick ONE target; ask if the human has not said. Don't repeat logged questions.
2. Number each question (Q1, Q2, ...) so the human can answer by number. Ask one at a time, each with ONE recommended answer, reason and trade-off. The human replies "ok" or says what to change. Match `audience`.
3. Challenge vague answers ("fast", "secure", "lots of users") until concrete: a number, an example, a yes or no. Offer a recommended concrete value.
4. Log each answer with its decision and reason. Flag **Hard to change later** choices.
5. Move "don't know yet" items to Open questions with a suggested way to resolve them.
6. Stop when the target is concrete or the human says stop; summarize in a few lines. Commit only `grill.md`.

## Gate
None. Open questions in `grill.md` block acceptance of the spec; tell the human which remain.

## Don't
- No more than one question at a time; no menus unless asked ("show options").
- Don't invent answers or write the spec here.

## Next
`spec` (or back to the stage that asked).
