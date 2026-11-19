---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# API design: <title>

Contract file: `design/openapi.yaml` (single source of truth; this page explains it).

## Endpoints
| Method | Path | Purpose | Auth / scope |
| --- | --- | --- | --- |

## Errors
One shape: `{ "error": { "code": "", "message": "" } }`. Codes used: ...

## Pagination, filtering, idempotency, rate limits
## Versioning and compatibility
Additive: ... Breaking: ... Deprecation path: ...

## Examples
Main flow and each error.

## Decisions
| Decision | Recommended | Reason and trade-off | Hard to change later |
| --- | --- | --- | --- |

## Open questions
- None (or list; any open question blocks acceptance).
