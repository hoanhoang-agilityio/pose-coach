---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
merged_at:
pr:
---

# Release: <title>

## What shipped
PR link, merge commit, and the intent it implements (`intent/NNN-slug`).

## Pipeline
Status of each CI/CD stage and any manual approvals still pending (production environment).

## Metrics to watch
| Metric | Normal range | Alert threshold | Where |
| --- | --- | --- | --- |

## Watch window
How long to watch after release and who is on point.

## Rollback
Exact steps to revert, and the signal that triggers them.
