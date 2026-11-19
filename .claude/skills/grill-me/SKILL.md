---
name: grill-me
description: Use when requirements are vague or a stage needs sharper answers, to interview the human one question at a time about a single target and log the decisions.
---

# grill-me

## Purpose
Interview the human relentlessly about ONE target at a time (users, core flows,
data, UI, integrations, non-functional needs, risks, ...) until every answer is
concrete. It records a Q/A/decision log that `intent`, `spec` and `design` must
use. It has no gate of its own.

## Reads
- The human's words, `CLAUDE.md`, `.sdlc/config.json` (`audience`).
- The existing `intent/NNN-slug/{intent,spec}.md` when used mid-change.
- An earlier `grill.md` for the same scope, to continue it.

## Writes
- `intent/NNN-slug/grill.md` from `.claude/skills/grill-me/template.md`, or
  `intent/000-product/grill.md` for the whole product.

## Steps
1. Ask which target to grill if the human has not said; pick ONE. Usable at any
   stage: before `intent`, during `spec`, during `design`.
2. Open the matching `grill.md` (create it if absent). Do not repeat a question
   already logged.
3. Ask ONE question at a time. Follow the recommend-first rule: each question
   carries one recommended answer in plain language, with reason and trade-off.
   The human replies "ok" or says what to change. Match `audience`: plain,
   jargon-free wording for `non-developer`; terser for `developer`.
4. Challenge vague answers ("fast", "simple", "secure", "lots of users") until
   they are concrete: a number, an example, a named person, a yes or no.
   Offer a recommended concrete value instead of asking again blindly.
5. After each answer append to the log: question, recommendation, answer,
   decision with reason. Flag hard-to-reverse decisions (database engine, cloud
   provider, public API contract) as **Hard to change later**.
6. Move unanswered or "I don't know yet" items to Open questions with a
   recommended way to resolve them.
7. Stop when the target is concrete or the human says stop. Summarize decisions
   and open questions in a few lines.
8. Commit only `grill.md`.

## Gate
None. Open questions in `grill.md` block acceptance of the later `intent`,
`spec` and `design`; tell the human which ones remain.

## Commit
`docs(NNN-slug): add grill` (`docs(000-product): add grill` for the product).

Commit on the change branch `feat/NNN-slug` (`fix/NNN-slug`).

## Don't
- Do not ask more than one question at a time, or present a menu of options
  (alternatives only if the human asks "show options").
- Do not accept vague answers silently.
- Do not set `status: accepted` anywhere, or write intent, spec or design here.
- Do not invent answers the human did not give.

## Next
`intent`, `spec` or `design`, whichever asked for the grilling.

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
