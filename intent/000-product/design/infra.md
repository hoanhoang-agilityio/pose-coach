---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Infrastructure design: Pose Coach v1

Inputs: `spec.md`, `design/design.md`, `grill.md` (Q4 platforms, Q6 on-device, Q8 no cloud, Q12 team and budget).
Plain terms: a **build** is the installable app file made from our code. **EAS Build** is Expo's online service that makes iOS and Android builds for us, so Hoan does not need a Mac or Android Studio set up. **TestFlight** is Apple's tool for sending test builds to testers; **Google Play internal testing** is Google's equivalent. **CI** is the automatic check that runs on every pull request.

There is no server, database host or cloud backend in v1. "Infrastructure" here means: how the app is built, checked and handed to testers.

## Environments
| Environment | Purpose | Differences |
| --- | --- | --- |
| Dev build | Hoan's own phone, daily work. Installed from an EAS "development" build; reloads code from the laptop. | Debug tools on; not distributed to anyone else. |
| Internal test | The 50 testers (success metric, intent). Built by EAS "preview" profile, sent via TestFlight (iOS) and Google Play internal testing (Android). | Release mode (real speed, so AC8 is measured here); store-signed. |
| Production | Public App Store and Google Play release. Later, not v1 test phase. | Needs store review, listing text without medical claims. |

No staging server exists because there is no server. "Internal test" plays the staging role.

## IaC changes
IaC means infrastructure described as files. v1 needs only small config files, no cloud resources.

| Resource | Change | File |
| --- | --- | --- |
| EAS build profiles (development, preview, production) | Add | `eas.json` |
| App identity (name, bundle id, camera permission text, no network permissions beyond default) | Add | `app.json` |
| CI workflow: lint + unit tests job | Proposed text below, human applies | `.github/workflows/sdlc-ci.yml` (protected) |
| `lintCommand` / `testCommand` | Human sets after they run once | `.sdlc/config.json` (protected) |
| Cloud resources | None | n/a |

## CI/CD stages
| Stage | Gate? | Notes |
| --- | --- | --- |
| `sdlc-gate` (existing) | Yes | Checks the PR points to an accepted plan and no agent-accepted artifacts. Unchanged. |
| Install + lint | Yes | Runs the repo's lint command on every PR. |
| Unit tests (Jest, form-rules engine with recorded data) | Yes | Runs on every PR; this is where AC5-AC7 are proven. |
| Existing `test` job | Yes | Already runs `testCommand` from `.sdlc/config.json` and skips if empty. Once the human sets `testCommand`, unit tests run through it with no workflow change. |
| EAS build | No (manual) | Hoan runs `eas build` for a test release; not on every PR, to stay inside the free build quota. |
| Submit to TestFlight / Play | No (manual) | `eas submit`, run by Hoan after a build looks good. |
| `deploy` job (existing placeholder) | n/a | Leave as is; v1 does not deploy to a server. Real store release stays a manual human step. |

**Proposed CI change (text for the human; CI files are protected, Claude cannot apply it).** The existing `test` job already installs Node dependencies and runs `testCommand`. Recommended minimal change: do not add a new workflow, just set both commands in `.sdlc/config.json` after they run on Hoan's machine:

    "lintCommand": "npm run lint",
    "testCommand": "npm test -- --ci"

If Hoan wants lint as its own visible check, add this step after "Install dependencies" in the `test` job:

    - name: Lint
      if: ${{ hashFiles('package.json') != '' }}
      run: npm run lint

Reason for the first form: fewer edits to a protected file. Trade-off: lint and tests share one check line on the PR.

## Deploy strategy
Strategy: **rolling, in small steps**. Each test build goes first to Hoan, then to a few testers, then to all testers. No feature flags in v1.

Rollback trigger: a crash on launch, camera not working, or a wrong-cue bug reported by testers.
Rollback steps:
1. In TestFlight and Play internal testing, stop the bad build (expire it / halt the rollout). Testers keep or reinstall the previous build, which both stores keep available.
2. Hoan tells testers by message which build to use.
3. Fix on a `fix/NNN-slug` branch, run tests, build again.
Optional later: **expo-updates** (sends small code-only fixes without a store review) gives faster rollback, but adds a network call and a second place for bugs. Not in v1 (keeps the "no network" promise simple to prove).

## Secrets and config
Never stored in the repo. Names only:

| Name | Where | Rotation |
| --- | --- | --- |
| `EXPO_TOKEN` (lets CI or scripts use EAS) | GitHub Actions secret, only if CI ever calls EAS; otherwise Hoan logs in locally | Every 6 months or if a laptop is lost |
| Apple signing certificates and provisioning profile | Held by EAS (managed credentials) | Apple renews yearly; EAS regenerates on request |
| App Store Connect API key (for `eas submit`) | EAS credentials store | Rotate if leaked |
| Google Play service account key (for `eas submit`) | EAS credentials store | Rotate if leaked |
| Android upload keystore | EAS-managed; Hoan downloads one backup copy to a password manager | Never rotated casually; losing it blocks updates |
| App runtime config | None; no API keys inside the app (no server) | n/a |

## Scaling and capacity
Nothing to scale: all work happens on each phone. Load limits are the phone's speed (see AC8 in the test strategy) and the EAS free build quota. Tester count is capped by TestFlight (up to 100 internal / 10,000 external) and Play internal testing (up to 100 testers), enough for 50.

## Backup and disaster recovery
Source code: GitHub repository. Signing keys: kept by EAS plus one backup copy in Hoan's password manager. No user data on any server, so nothing to restore; users' history lives only on their own phone (already accepted in grill Q8).
RPO: not applicable (no server data); code is as recent as the last push. RTO: about 1 working day to rebuild and re-upload a build, if the previous one must be replaced.

## Cost estimate
| Item | Monthly | Driver |
| --- | --- | --- |
| Apple Developer Program | about $8.25 ($99 per year) | Needed for TestFlight and App Store; **required**, no free path |
| Google Play developer account | $0 ongoing ($25 once) | One-time fee |
| EAS Build | $0 on free tier | Free tier has a monthly build quota with slower queue; enough for a few builds a week |
| GitHub Actions | $0 | Free minutes for a small repo |
| Servers, database, analytics | $0 | None used |
| Total | about $8.25 per month, $124 in the first year | Stays within "budget near zero" |

If the free EAS quota runs out, builds can be done on a Mac with `eas build --local` or Xcode for free; paid EAS is the fallback, not the plan.

## Decisions
| Decision | Recommended | Reason and trade-off | Hard to change later |
| --- | --- | --- | --- |
| Build service | EAS Build, free tier | No Mac or Android Studio setup; handles signing for you. Trade-off: queue waits and a monthly build limit. | No |
| Hosting / cloud provider | None in v1 | Matches the privacy promise and the budget. Trade-off: no remote analytics or kill switch. | **Hard to change later** (adding a backend later is a new design, and the "no data leaves the phone" promise would need a fresh decision) |
| App identifiers (iOS bundle id, Android package name) | Choose once, e.g. `vn.<brand>.posecoach`, before the first store upload | Store records are tied to it forever. Trade-off: must decide the brand/domain now. | **Hard to change later** |
| CI | Reuse existing `test` job by setting `lintCommand` and `testCommand`; keep `sdlc-gate` | Smallest change to a protected file. Trade-off: lint and tests are one check. | No |
| Distribution to testers | TestFlight + Google Play internal testing | Official, free after the account fees, no public listing needed. Trade-off: Apple review of the first TestFlight build (usually hours to a day). | No |
| Environments | dev build, internal test, production later | One extra environment per real need. Trade-off: no separate staging. | No |
| Secrets | Held in EAS credentials and GitHub secrets, never in repo; Claude never sees values | Prevents leaks. Trade-off: Hoan must keep a backup of the Android keystore. | **Hard to change later** (losing the Android keystore blocks app updates) |
| Over-the-air updates (expo-updates) | Not in v1 | Keeps the no-network proof simple. Trade-off: every fix needs a new store build. | No |
| Release to production | Manual, by Hoan, after the 90-day metrics look good | Store review and listing wording (no medical claims, R16) need a human. | No |

## Open questions
- Brand and app identifier (bundle id / package name). Recommended: `vn.posecoach.app` unless Hoan owns a domain; Hoan to confirm before the first EAS build. Blocks the plan only for the build step.
- Apple Developer and Google Play accounts: do they exist yet? Recommended: Hoan registers both now (Apple approval can take days); needed before AC1 on a real iPhone via TestFlight.
- Reference phones (iPhone 11, Galaxy A52 or similar): Hoan to confirm access. Recommended: borrow them; if not, test on the nearest equivalents and say so in the AC8 result.
