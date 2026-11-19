# REVIEW.md (project-owned)

Rules the `review-pr` skill enforces on top of `CLAUDE.md`. Edit freely; ai-sdlc never overwrites this file.

## Must flag (Important)
- Behavior that contradicts the spec or acceptance criteria.
- Missing tests for new behavior or a fixed bug.
- Unvalidated external input, secrets in code, or weakened auth checks.
- Breaking changes to public APIs or data formats without a migration path.

## Usually a Nit
- Naming, comment wording and formatting a linter does not enforce.

## Ignore
- Generated files, lockfiles, vendored code.

## Project conventions
- (Add error handling, layering, test style and naming rules here.)
