# pose-coach

<!-- ai-sdlc:start -->
## AI-native SDLC (managed by ai-sdlc)

Every change moves through committed artifacts in `intent/NNN-slug/`:
intent -> spec -> design -> plan -> build -> review -> ship -> incident (spec and design are skipped when `risk: low`).

- A human sets `status: accepted`, `accepted_by` and `accepted_at` on each gated artifact. Never write them yourself.
- Accepted artifacts are frozen. If one is wrong, stop and ask the human to set it to `draft`.
- No code edits until the active change (`.sdlc/active`) has an accepted `plan.md`.
- Read `.sdlc/policies/*.md` and `REVIEW.md` before spec, plan and review.
- Protected files (hooks, `.claude/settings*.json`, `.sdlc/config.json`, `.sdlc/kit-lock.json`, `.sdlc/bypass.log`, CI workflow, CODEOWNERS) are human-only: propose the change and ask the human to apply it.
- One branch per change carries every stage; the human accepts by committing the frontmatter edit themselves.
- Work on branch `feat/NNN-slug` (`fix/NNN-slug` for incident or bug fixes). Never push to the default branch, force push, use `--no-verify`, or merge PRs.
- Conventional Commits: artifacts `docs(NNN-slug): <stage> <summary>`; code `feat|fix|test|refactor|chore(NNN-slug): ...`.
- Design stage (`intent/NNN-slug/design/`): `design.md` lists `requires: [...]` discipline skills; `plan.md` is blocked until `design.md` and every required artifact are accepted. `security-design` is always required when `sensitivePaths` are touched; `test-strategy` for medium/high risk.
- `grill.md` (from `/grill-me`) holds interview decisions; `intent`, `spec` and `design` must read it and carry its decisions. Any open question in it blocks acceptance; tell the human.
- Skills: `/sdlc-new-product`, `/sdlc-adopt-existing`, `/grill-me`, `/intent`, `/spec`, `/design`, `/architecture`, `/prototype`, `/design-system`, `/frontend-design`, `/api-design`, `/backend-design`, `/data-model`, `/infra-design`, `/security-design`, `/test-strategy`, `/observability-design`, `/plan`, `/build`, `/review-pr`, `/ship`, `/incident`, `/sdlc-status`.

### Recommend-first rule
Applies to every skill that asks the human anything.
- Analyse the options yourself, then present ONE recommended answer in plain language, with the reason and the trade-off in 1-2 sentences. Never a menu.
- The default is accept: the human replies "ok" or says what to change.
- Show alternatives only if the human asks ("show options") or the options are genuinely close (still mark one as recommended).
- Read `audience` in `.sdlc/config.json`. `non-developer` (default): no jargon, explain each technical term briefly. `developer`: terser, alternatives inline.
- Record each recommendation in the artifact as a decision with its reason.
- Flag hard-to-reverse choices (database engine, cloud provider, public API contract) as **Hard to change later**.
<!-- ai-sdlc:end -->
