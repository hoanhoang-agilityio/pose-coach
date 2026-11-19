---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Plan: <title>

## Files
| File | Change |
| --- | --- |
| path/to/file | what changes and why |

## Steps
1. Ordered, small steps. Tests come first.

## Test plan
- Tests to write first, and the command that runs them.

## Policies applied
- Rules from `.sdlc/policies/*.md` that constrain this plan.

## Rollback
How to undo this change safely (revert commit, flag off, down-migration).
