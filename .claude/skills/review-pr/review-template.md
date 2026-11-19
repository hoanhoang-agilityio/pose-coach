---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
pr:                 # PR URL
round: 1
---

# Review: <title>

## Round 1
Scope: full diff. Angles run: spec coverage, correctness, CLAUDE.md/REVIEW.md rules, performance.

| # | Tag | File:line | Finding | Verifier votes |
| --- | --- | --- | --- | --- |
| 1 | Important / Nit / Pre-existing | path:12 | description | 3/3 |

## Security review
Result of the separate `/security-review` pass. Open findings block merge.

## Dropped
Findings that failed verification or were style-only (one line each).

## Approvals needed
Risk tier, required human approvals, who must approve. Claude never approves or merges.
