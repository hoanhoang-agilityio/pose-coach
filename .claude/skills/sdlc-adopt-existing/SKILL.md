---
name: sdlc-adopt-existing
description: Use right after installing ai-sdlc in an existing repository, to map the codebase and set up CLAUDE.md, REVIEW.md and first intents without changing app code.
---

# sdlc-adopt-existing

## Purpose
Onboard an existing codebase into the chain. Write the documents Claude needs
(`CLAUDE.md`, `docs/codebase-map.md`, `REVIEW.md`), propose `sensitivePaths`,
and draft up to 5 intents. No application code changes.

## Reads
- Manifests, lockfiles, CI config, README, existing docs, tests, and the git log.
- TODO/FIXME comments and the result of the test command.
- `.sdlc/config.json` and any existing human-written `CLAUDE.md`.

## Writes
- `intent/000-adopt/intent.md` and `intent/000-adopt/plan.md` (risk `low`)
  covering this setup work.
- `CLAUDE.md` (only adds to human content), `docs/codebase-map.md`, `REVIEW.md`.
- Reverse-engineered drafts, each `status: draft` with frontmatter: `docs/design-system/`
  (`design-system.md`, `tokens.json`, `components.md`), `docs/architecture.md`,
  `docs/data-model.md`, `docs/api.md`, `docs/infra.md`. They describe what exists; a
  human reviews and accepts them.
- A printed JSON change for `.sdlc/config.json` (`testCommand`, `lintCommand`,
  `sensitivePaths`). The config is protected: you never edit it.
- Up to 5 draft intents in `intent/NNN-slug/intent.md`.

## Steps
1. Create `intent/000-adopt/intent.md` (from the intent template, risk `low`,
   status draft) and `plan.md` listing the files this skill will write. Tell the
   human to review both; docs under `docs/`, `CLAUDE.md`, `REVIEW.md` and
   `.sdlc/` are on the allowlist so you can continue, but the human should
   accept them.
2. Map the codebase: layout, entry points, modules, data stores, external
   services, build and deploy. Write `docs/codebase-map.md` with real paths.
3. Reverse-engineer the draft docs listed under Writes from the real code and
   config (real paths, real schema, real endpoints, real pipeline). Mark anything
   you could not verify as "unverified". Follow the recommend-first rule (see `CLAUDE.md`): one recommended answer with reason and trade-off, not a menu; match `audience` in `.sdlc/config.json`.
4. Find the test command and run it. Verify it really runs and note pass/fail.
   Print the exact JSON change for `testCommand` (and `lintCommand`) and ask
   the human to apply it to `.sdlc/config.json`; only if verified, otherwise
   say why it stays null.
5. Write `CLAUDE.md`: keep every line the human wrote; add commands,
   architecture summary and conventions you observed. Never delete or rewrite
   human text.
6. Write `REVIEW.md` from observed conventions (naming, error handling, test
   style, layering) so the reviewer can enforce them. Mark it as project-owned.
7. Propose `sensitivePaths` (auth, billing, migrations, CI, infra, secrets
   handling) as a printed `"sensitivePaths": [...]` JSON snippet and ask the
   human to apply it to `.sdlc/config.json` (protected, human-only).
8. Draft at most 5 intents from TODO/FIXME comments, failing tests and what the
   human tells you. Use the `intent` skill's template, each `status: draft`,
   with a proposed risk.
9. Commit in separate commits: adoption artifacts, docs, then each intent.

## Gate
Tell the human to review `intent/000-adopt/` and each drafted intent, and to set
`status: accepted`, `accepted_by` and `accepted_at` themselves. The next skill
for an accepted intent is `spec` or `plan`.

Accept by editing the frontmatter and committing it yourself (`docs(000-adopt): accept intent`). Do not ask Claude to commit it: CI rejects acceptance
commits that carry a Claude co-author trailer. Optionally push the branch early
and open a draft PR to review the artifacts on GitHub.

## Commit
On branch `feat/000-adopt` created from the default branch.
`docs(000-adopt): add intent and plan`, then `docs(NNN-slug): add intent` per
intent.

## Don't
- Do not edit `.sdlc/config.json`, hooks or settings (protected; propose the
  change instead).
- Do not change application code, tests or dependencies.
- Do not overwrite or delete human text in `CLAUDE.md` or existing docs.
- Do not set `status: accepted` on anything.
- Do not claim a command works without running it.
- Do not draft more than 5 intents.
- Do not touch `.env*` or credentials.

## Next
For each accepted intent: `spec` (medium/high) or `plan` (low).

If anything above cannot be done (missing file, unaccepted artifact, failing
command), stop and tell the human exactly what is missing instead of guessing.
