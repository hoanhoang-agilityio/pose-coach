---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
detected_at:
severity:           # sev1 | sev2 | sev3
---

# Incident: <title>

## Signal
What fired (alert, metric, bug report) with links and timestamps.

## Impact
Who and what was affected, for how long.

## Timeline
- hh:mm event

## Root cause
Which control should have caught this and why it did not (spec, test, review, CI, monitoring).

## Fix
The change that resolves it (a new intent) and the regression test it needs.

## Eval case
Path to `evals/review-cases/NNN-slug.md` describing the diff pattern a reviewer should have caught.

## Follow-ups
- Process or control improvements.
