# pose-coach

<!-- ai-sdlc:start -->
## AI-native SDLC (ai-sdlc)

Chain in `intent/NNN-slug/`: spec -> design -> plan -> build -> review -> ship (+ incident). Risk lanes: trivial = plan only; low = plan; medium/high = spec, design, plan (high needs `## Security`).

- Only a human accepts (`/accept <stage>` on the PR, or the CLI `accept`). Never write `status: accepted`, `accepted_by` or `accepted_at`, or run accept. Accepted files are frozen: ask the human to set `draft`.
- No code before an accepted plan, except `risk: trivial`.
- Branch `feat|fix/NNN-slug`; Conventional Commits. Never push the default branch, force push, `--no-verify` or merge.
- Protected files (hooks, `.claude/settings*.json`, `.sdlc/*`, CI, CODEOWNERS) are human-only: propose, don't edit.
- Read `.sdlc/policies/*.md` and `REVIEW.md` before spec, plan and review.

Recommend-first: give ONE recommended answer with reason and trade-off, default accept ("ok"). Read `audience` in `.sdlc/config.json` (`non-developer`: plain words). Flag **Hard to change later**.
<!-- ai-sdlc:end -->
