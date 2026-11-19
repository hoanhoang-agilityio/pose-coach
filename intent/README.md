# intent/

Every change lives in `intent/NNN-slug/`:

| File | Purpose | Who accepts |
| --- | --- | --- |
| `intent.md` | what, why, constraints, success metric | product owner |
| `spec.md` | requirements, design, acceptance criteria (skipped for `risk: low`) | human |
| `plan.md` | files, ordered steps, test plan, rollback | human |
| `build-log.md` | progress during build | not gated |
| `review.md` | layered review result | PR approvers |
| `release.md` | metrics to watch, rollback | production approver |
| `incident.md` | diagnosis of a breached control | human |

Frontmatter on gated artifacts: `status` (draft | accepted | rejected), `risk` (low | medium | high),
`accepted_by`, `accepted_at`. Only a human sets `status: accepted`. Accepted files are frozen;
set `status: draft` to reopen one.
