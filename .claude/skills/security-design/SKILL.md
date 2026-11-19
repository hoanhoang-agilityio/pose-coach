---
name: security-design
description: Use when a change touches sensitivePaths, auth, personal data or untrusted input and needs a threat model and security controls decided before planning.
---

# security-design

## Purpose
Find and design out security problems before code: a STRIDE threat model, authentication and authorization, data protection, input validation, applicable OWASP ASVS items, supply-chain risk and abuse cases.

## When required
Always required when the change touches any `sensitivePaths` entry in `.sdlc/config.json`. Also required for auth, personal data, payments, file upload or any new external input.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `security-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `sensitivePaths` in `.sdlc/config.json` and `.sdlc/policies/*.md`.
- `design/architecture.md`, `design/api.md`, `design/data-model.md` if present.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/security.md` from `.claude/skills/security-design/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `security-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. List the assets (data, credentials, money, availability) and the trust boundaries the change crosses; take them from the architecture diagrams.
4. Build a STRIDE table: for each boundary or flow, threats under Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege, with a mitigation and an owner step.
5. Specify authentication and authorization: who may do what, how it is checked (server side, per request), session and token lifetime. Auth model choices are **Hard to change later**.
6. Specify data protection: encryption in transit and at rest, key handling, what is logged and what must never be logged, PII minimization.
7. Specify input validation and output encoding for every external input, and pick the applicable OWASP ASVS items (cite requirement IDs) with how each is met.
8. Cover dependencies and supply chain (new packages, pinning, scanning) and write abuse cases (how a malicious or careless user could misuse each feature) with the control that stops each.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/security.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept security-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add security-design design`

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
