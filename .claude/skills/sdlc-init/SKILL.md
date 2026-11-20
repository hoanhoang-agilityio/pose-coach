---
name: sdlc-init
description: Use right after installing ai-sdlc, to set up the project. Reads mode (new or existing) from .sdlc/config.json.
---

# sdlc-init

## Purpose
Set up the project for the chain. `mode: new` starts a product from an interview; `mode: existing` maps the codebase. No application code in either mode.

## Reads
- `.sdlc/config.json` (`mode`, `audience`, `sensitivePaths`), `.sdlc/policies/`, any human-written `CLAUDE.md`.
- `existing` only: manifests, CI config, README, docs, tests, git log, TODO/FIXME, and the result of the test command.

## Writes
- `new`: `intent/000-product/grill.md`, then `intent/000-product/spec.md` (risk `medium`, includes a Stack proposal), and a draft `CLAUDE.md` project section.
- `existing`: `CLAUDE.md` project section (commands, architecture summary, conventions; keep every human line), `REVIEW.md` from observed conventions, `docs/codebase-map.md`.
- Printed JSON changes for `.sdlc/config.json` (`testCommand`, `lintCommand`, `sensitivePaths`). The config is protected: never edit it.

## Steps
1. Read `mode`. If missing, stop and ask the human to set it.
2. `new`: run `grill-me` on the whole product (users, core flows, data, integrations, risks). Write the product spec from the answers; recommend ONE stack with reason and trade-off and flag database and cloud provider as **Hard to change later**. Do not scaffold code; that needs an accepted plan.
3. `existing`: map layout, entry points, modules, data stores, external services, build and deploy, with real paths. Mark anything unverified. Find the test command, run it once, and report pass or fail.
4. Print the exact JSON for `testCommand`, `lintCommand` and proposed `sensitivePaths` (auth, billing, migrations, CI, infra, secrets) and ask the human to apply it.
5. Suggest up to 3 first changes as one-line ideas; the human picks one and `spec` starts it.
6. Commit separately: docs, then the spec if any.

## Gate
`new`: human accepts the product spec (`/accept spec` on the PR, or the local accept command). `existing`: nothing to accept; the human reviews `CLAUDE.md` and `REVIEW.md`.

## Don't
- No application code, no edits to protected files, no `status: accepted`.
- Don't rewrite or delete human text in `CLAUDE.md`.
- Don't present menus; recommend one answer (see `CLAUDE.md`).

## Next
`spec` for the first change.
