---
name: infra-design
description: Use when a change needs new or changed environments, infrastructure as code, CI/CD, deploy strategy, secrets, scaling or cost decided before planning.
---

# infra-design

## Purpose
Decide how the change is run and delivered: environments, infrastructure as code changes, CI/CD stages, deploy strategy, secrets and config, scaling, backup and disaster recovery, and cost. `ship` follows this file.

## When required
Required when the change adds infrastructure, changes the pipeline, needs new secrets or config, or needs a non-default deploy strategy (flag, canary, blue-green).

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `infra-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- IaC (Terraform, Pulumi, CloudFormation, Dockerfiles, Helm), `.github/workflows/`, `docs/infra.md` if present.
- `design/architecture.md`, `design/security.md`, `design/observability.md` if present.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/infra.md` from `.claude/skills/infra-design/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `infra-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Inventory what exists: environments, IaC files, pipeline stages, hosting; use real paths.
4. Recommend the environment set (for example dev, staging, production) and the IaC changes needed, as a list of resources added or changed. Choosing a cloud provider or hosting model is **Hard to change later**; recommend one with reason and trade-off.
5. Define CI/CD stages (lint, test, build, scan, deploy) and which are gates. Do not edit the protected CI workflow; propose changes for the human to apply.
6. Choose the deploy strategy (feature flag, canary, blue-green, rolling) from the risk, with the rollback trigger and steps.
7. List secrets and config: names, where they live, who rotates them. Never write values.
8. Estimate scaling and capacity (expected load, limits, autoscaling), backup and disaster recovery (RPO and RTO), and monthly cost with the main drivers.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/infra.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept infra-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add infra-design design`

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
