---
name: observability-design
description: Use when a change needs logs, metrics, traces, SLOs, alerts, dashboards and runbooks decided so a breach of the intent success metric is noticed.
---

# observability-design

## Purpose
Decide how the change is watched in production: logs, metrics and traces, SLIs and SLOs, alerts tied to the intent success metric, dashboards and runbooks. `ship` verifies these are live and `incident` starts from these alerts.

## When required
Required when the change adds user-visible behavior, a service, a job or a dependency that can fail in production.

## Reads
- `intent/NNN-slug/spec.md` (must be `status: accepted`) and `design/design.md` (its `requires:` must list `observability-design`).
- `intent/NNN-slug/grill.md`: decisions carry into this artifact.
- `CLAUDE.md`, `.sdlc/policies/*.md`, `.sdlc/config.json` (`audience`, `sensitivePaths`).
- `intent.md` success metric.
- Existing logging, metrics and alerting setup and `docs/infra.md`.
- `design/infra.md`, `design/architecture.md`, `design/backend.md` if present.
- Existing code and docs the change touches (read only).

## Writes
- `intent/NNN-slug/design/observability.md` from `.claude/skills/observability-design/template.md`, `status: draft`, same `risk:` as the spec.

## Steps
1. Confirm `spec.md` is `status: accepted` and `design/design.md` lists `observability-design` in `requires:`. If not, stop and tell the human which file to review or edit.
2. Read `grill.md`. Carry its decisions into this artifact. If it has any open question, finish the draft but tell the human that the open question blocks acceptance and must be answered first (use `grill-me`).
3. Restate the intent success metric and the guardrails (errors, latency, saturation) in measurable terms.
4. Define signals: structured log events (fields, levels, no PII), metrics (name, type, labels) and trace spans for key flows.
5. Define SLIs with how each is computed, and SLOs with target and window. Recommend targets with reason and trade-off.
6. Define alerts: condition, threshold, severity, who is notified, and the success-metric or SLO it protects. Each alert gets an id that `incident` can cite.
7. Specify dashboards (panels per SLI and the success metric) and where they live.
8. Write a runbook per alert: first checks, likely causes, safe mitigations and rollback pointer (`design/infra.md`). Do not change monitoring config yourself; list what the human must create.
9. Follow the recommend-first rule: for every choice give ONE recommended answer in plain language with reason and trade-off, default accept ("ok"). Record each as a row in Decisions. Match the `audience` in `.sdlc/config.json`.
10. Check the touched paths against `sensitivePaths`; if any match, risk is at least `medium`. Never lower the spec's risk.
11. Commit only the files this skill wrote.

## Gate
Tell the human: "Review `intent/NNN-slug/design/observability.md`. When it is right, YOU set `status: accepted`, `accepted_by` and `accepted_at`." Stop. `plan` stays blocked until it is accepted.

Accept by editing the frontmatter and committing it yourself (`docs(NNN-slug): accept observability-design`). Do not ask Claude to commit it: CI rejects acceptance commits that carry a Claude co-author trailer.

## Commit
`docs(NNN-slug): add observability-design design`

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
