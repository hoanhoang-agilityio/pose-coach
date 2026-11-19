---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Test strategy: Pose Coach v1

Inputs: `spec.md` (AC1-AC12), `design/design.md`, `grill.md` (Q7 speed, Q9 success metric, Q6 privacy), `infra.md`.
Plain terms: a **unit test** checks one small piece of logic on a computer, in seconds. A **component test** checks one screen or widget in isolation. **Jest** is the free JavaScript test runner. **Pose points** are the 33 body points per camera frame. A **labelled set** is one recorded exercise attempt converted to pose points, plus a human's note of the true rep count and any form error.

The idea: the risky part, the form-rules engine (plain TypeScript, no camera), is tested hard on a computer with recorded data. Only what truly needs a phone is checked by hand.

## Pyramid for this change
| Level | Count / scope | Why |
| --- | --- | --- |
| Unit tests (rules engine on recorded data) | Many: 30+ labelled sets per exercise (90+ total) plus small angle/phase tests | Fast, repeatable, no phone; proves accuracy (AC5-AC7) |
| Component tests (React Native Testing Library + Jest) | One file per screen (5 screens) plus the voice-cue throttle and i18n check | Proves screens show the right text and data without a camera |
| Device / manual checks | About 6 checks, run on both reference phones | Camera, speed, airplane mode and real installs cannot be faked on a laptop |
| End-to-end automated (Detox/Maestro) | None in v1 | Costly to set up and flaky with a live camera; manual checks cover it. Revisit before public release |

## Acceptance criteria to tests
Test file paths are proposed; `plan` fixes the final layout.

| Criterion | Level | Test file | Behavior |
| --- | --- | --- | --- |
| AC1 installs and opens on iOS and Android | Manual (device) | n/a, checklist M1 | Install the same-code build on an iPhone and an Android phone via TestFlight / Play internal testing; app opens to Home |
| AC2 half out of frame: asks to move, no start; 2 s in frame then 3-2-1 | Unit + component | `src/rules/__tests__/framing.test.ts`, `src/screens/__tests__/Setup.test.tsx` | Unit: pose points with missing/low-confidence body points report "not in frame" with direction; 2 s timer starts only when all points are present. Component: Setup screen shows the move message and then the countdown. Real-camera framing is also in M2 |
| AC3 flight-mode workout, no image/video data | Manual (device) + unit | `src/__tests__/no-persist.test.ts`, checklist M3 | Unit: static check that no code imports file-write or network APIs in the camera path. Manual: see Privacy check below |
| AC4 only squat, push-up, plank | Component | `src/screens/__tests__/Home.test.tsx` | Home lists exactly three exercises, in that order, nothing else |
| AC5 rep count exact in >=95% of sets, 30+ sets per exercise | Unit (data-driven) | `src/rules/__tests__/repCount.squat.test.ts`, `repCount.pushup.test.ts` | For every labelled set, engine rep count equals the human count; test fails if the exact-match share is below 95% per exercise (summary printed with failing set names) |
| AC6 plank timer runs on correct form, pauses on sag | Unit (data-driven) | `src/rules/__tests__/plankTimer.test.ts` | On labelled correct-plank sets, timer is within +/-1 s of the human-labelled hold time; on sag sets the timer stops during the labelled sag periods |
| AC7 each error triggers the right cue + red part; correct data none; cues >=2 s apart | Unit (data-driven) + component | `src/rules/__tests__/formErrors.test.ts`, `src/rules/__tests__/cueThrottle.test.ts`, `src/components/__tests__/Outline.test.tsx` | Each of the 8 listed errors (squat 3, push-up 3, plank 2) fires its cue on its labelled sets; correct sets fire none (zero false cues allowed); no two cues less than 2 s apart (fake clock); outline component renders the labelled body part red and the rest green |
| AC8 20 fps and 0.3 s on iPhone 11 and Galaxy A52 | Manual (device) measurement | checklist M4 | See Performance below |
| AC9 summary shows reps/seconds, score, top mistake; History newest first after restart | Unit + component + manual | `src/summary/__tests__/score.test.ts`, `src/db/__tests__/history.test.ts`, `src/screens/__tests__/Summary.test.tsx` | Unit: score = share of correct reps or time, 0-100, top mistake = most frequent error. DB test: saved sets come back newest first. Manual M5: force-close and reopen on a real phone, set still listed |
| AC10 no sign-in screen or account network call | Component + unit | `src/__tests__/no-auth.test.ts`, M3 network log | Test that no route/screen named login or account exists and no HTTP client is imported; network log in M3 shows zero requests |
| AC11 all visible text from Vietnamese translation file | Unit (automated scan) | `src/__tests__/i18n-strings.test.ts` | Scan app source for hard-coded text in UI components (lint rule `no-literal-string` or script); every translation key used exists in `vi.json` and no key is empty |
| AC12 first launch shows "not medical advice" note | Component + manual | `src/screens/__tests__/Disclaimer.test.tsx`, M6 | Fresh storage shows the note once; after acknowledging it does not reappear; text equals the translation key's Vietnamese value. M6: fresh install on a phone |

## Contract and migration tests
No API, so no contract tests. The History table (`design/data-model.md`, if drafted) needs a migration test: create the empty table from scratch and, once a second schema version exists, upgrade from the previous version without losing rows (`src/db/__tests__/migrate.test.ts`).

## Test data
**Recorded pose data (the base of AC5-AC7).**
1. **Record.** Hoan records about 10 short phone videos per exercise at the camera angle the app will ask for (side view for push-up and plank, front or 45 degrees for squat). Cover: correct form, and every listed error for that exercise (squat 3, push-up 3, plank 2). Vary the person (family and friends, with their OK), clothes, lighting and room where possible. Include both a few clean sets and a few messy ones (phone tilted slightly, partial occlusion).
2. **Convert once, offline.** A one-time script (dev tool, not part of the app, lives in `tools/`) runs the same pose detector over each video on a computer and writes a JSON file of pose points per frame with timestamps.
3. **Label by hand.** For each file, a person writes the true rep count (or plank hold seconds) and the error type with start/end time, into a small sidecar section of the same JSON (`labels`). One person counts, a second spot-checks 20% to catch counting mistakes.
4. **Keep only the numbers.** Only the JSON files are committed under `test-data/pose/<exercise>/`. **The videos are deleted** after conversion and never committed or uploaded. Reason: people's faces and homes are private, and it matches the product promise. The JSON holds only anonymous body-point coordinates.
5. **Naming and index.** `squat-correct-03.json`, `squat-knees-in-02.json`, and so on, plus `test-data/pose/index.json` listing each file, who/lighting tags (initials only, not names), and the label. Each set records the detector name and version so a model upgrade can be re-run.

**How many.** Target >= 30 labelled sets per exercise (squat, push-up; plank needs 30 hold/sag sets for AC6). 10 videos each contain several reps, so each video is cut into separate sets (for example 3 sets of 5-8 reps from one clip) to reach 30. If after cutting a person or lighting type is over-represented (more than 40% from one person), record more. Hoan's consent from every person filmed is kept outside the repo.

**Why 30.** With 30 sets, 95% means at most 1 miss. This is a small sample and only a rough check; the 90-day tester feedback is the wider check.

**Keeping the data honest.** About 20% of sets are held out and only used at the end (not while tuning the rules), so we do not tune to the exact files we judge ourselves on.

**Synthetic data (small).** Hand-made pose frames (a straight line of points, a bent knee at exactly 90 degrees) for unit tests of single angle functions. Cleanup: none; all fixtures are read-only files.

## Performance and load
| Check | Target | Tool |
| --- | --- | --- |
| Pose detection speed | >= 20 fps average over a 60 s workout, with no 5 s window under 18 fps, on iPhone 11 and Galaxy A52 | A debug-only on-screen counter (frames processed per second, from the frame-processor timestamps), read aloud/recorded on screen; also Xcode Instruments / Android Studio Profiler for a cross-check. Run on a release (preview) build, not the dev build |
| Feedback delay | <= 0.3 s from movement to outline colour change and cue start | Film the phone and the person with a second phone in 240 fps slow motion. Count frames from the moment of the mistake (e.g. knee passes the line) to the first red frame; at 240 fps, 0.3 s = 72 frames. Repeat 10 times per phone and report the worst and the median. Cue audio start is timed the same way |
| Heat and battery | Not failing the 20 fps target after 10 minutes of continuous use | Same fps counter after 10 min; note phone warmth. Informal, report only |
| Rules engine speed | One frame processed in under 5 ms on a laptop (keeps rules cheap relative to the 50 ms frame budget) | Jest timing test `src/rules/__tests__/perf.test.ts` over a recorded set; loose bar to avoid flaky failures |

Each measurement is saved as a line in the PR description (phone, build, number) so AC8 has evidence. If a phone fails, the response is to lower the camera resolution or skip frames before touching the rules; this is a plan matter.

## Privacy check for AC3
Run on both reference phones with the preview build:
1. **Fresh install.** Record the app's storage size (phone Settings > Storage, or Android Studio / Xcode device file view).
2. **Flight mode on, Wi-Fi off.** Do a full workout of each exercise and view History. Everything must work.
3. **Files after.** Inspect the app's sandbox: Xcode > Devices > Download Container (iOS), `adb shell run-as <package> find . -type f` (Android debug build). Pass: no `.jpg`, `.png`, `.mp4`, `.mov`, `.heic`, no frame dumps, and only the expected SQLite file and settings. Camera roll and Photos unchanged.
4. **Network log.** With flight mode off, route the phone through a laptop proxy (mitmproxy or Charles) or use the iOS App Privacy Report / Android `Network Profiler` for the app during one workout. Pass: zero requests from the app (store/OS traffic is not ours).
5. **Permissions.** The app asks only for camera (and no microphone, location, photos, contacts). Android manifest and iOS Info.plist reviewed.
Also the unit test and a dependency review: no analytics or crash-report packages that phone home.

## Evals (AI features)
Pose detection is a ready-made on-device model (ML Kit), not trained by us, so the "eval" is the labelled-set test above. How regressions are caught: the labelled sets run in CI on every PR; a change that drops exact rep match below 95%, or adds a false cue on a correct set, fails the PR. When the ML Kit version is upgraded, re-convert one or two videos is not possible (videos deleted); instead keep the JSON and run a short on-device check (M2/M4) to confirm the new model's output is similar. Pass threshold: AC5 >= 95%, AC7 zero false cues on correct sets.

## Manual
| What | Why not automated |
| --- | --- |
| M1 Install and open on iPhone and Android (AC1) | Needs real devices and store distribution |
| M2 Real camera framing: half out of frame, step back, 2 s then countdown, in good and dim light (AC2) | Needs a live camera; unit tests cover the logic only |
| M3 Flight mode full workout, file and network inspection (AC3, AC10) | Needs a real phone and device tools |
| M4 fps and feedback delay on iPhone 11 and Galaxy A52 (AC8) | Needs real hardware and a release build |
| M5 Force-close and reopen: History intact (AC9) | Needs a real app restart; DB logic is unit-tested |
| M6 Fresh install shows the "not medical advice" note (AC12) | Needs a clean install |
| M7 Vietnamese voice cue is understandable on both phones | Voice quality differs by phone (spec risk); subjective |
| M8 Tester feedback score >= 4/5 (intent success metric, not an AC) | Comes from people, via a short TestFlight/Play feedback question |

## Test commands (proposal)
Jest with the React Native preset (`jest-expo`). Proposed `package.json` scripts, to be created by `build`:

    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest",
    "test:rules": "jest src/rules"

**Proposed values for `.sdlc/config.json` (protected; Hoan sets them, and only after the commands have actually run green once on Hoan's machine):**

    "lintCommand": "npm run lint",
    "testCommand": "npm test -- --ci"

Until then they stay `null`; the existing CI `test` job skips cleanly when `testCommand` is empty.

## Decisions
| Decision | Recommended | Reason and trade-off |
| --- | --- | --- |
| Test runner | Jest (with `jest-expo`) | Common, free, what the spec already names. Trade-off: native camera code cannot run in it, so that part stays manual |
| Where accuracy is proven | Rules engine on recorded pose JSON, in CI | Repeatable on every PR with no phone. Trade-off: recorded data may not cover all real-world cases, so tester feedback complements it |
| Test data origin | Hoan records ~10 videos per exercise, converted once, only JSON kept | Real people, real mistakes; videos deleted for privacy. Trade-off: about half a day of recording and labelling work |
| Sample size | >= 30 labelled sets per exercise, ~20% held out | Gives the 95% check meaning (<= 1 miss). Trade-off: small sample; widened by tester results over 90 days |
| Automated end-to-end tests | None in v1 | Camera e2e is flaky and expensive. Trade-off: more manual checks on release builds |
| Performance measurement | On-screen fps counter + slow-motion film for delay, on release builds | Cheap, no special gear. Trade-off: manual and a bit rough (+/- 1 frame at 240 fps is about 4 ms, fine for 0.3 s) |
| Privacy proof | Flight-mode run + file listing + network log, per release | Directly checks the promise. Trade-off: repeated by hand before each test release |
| Pass bars in CI | 95% rep match per exercise; zero false cues on correct sets; cues >= 2 s apart | Matches the spec; fail-fast. Trade-off: tuning the rules might need a dataset refresh if the bar is hit with one miss |
| `testCommand` / `lintCommand` | Proposed above; human sets after a real green run | Protected file and "only after it runs" rule |

## Open questions
- Who is the second person who spot-checks 20% of the labels? Recommended: a friend who trains, ~1 hour; if none, Hoan re-counts after a week.
- Plank hold tolerance: +/-1 s proposed in AC6 test. Recommended: accept; not in the spec, so Hoan confirms it as a test choice, not a requirement.
- Whether `tools/` (the one-off video-to-JSON script) is allowed in the repo given `codePathsAllowlist` in `.sdlc/config.json` does not list it; it only becomes allowed once the plan is accepted. Recommended: list it in `plan.md` as a dev tool.
- Consent wording for people filmed. Recommended: a one-line message ("video is used only to make anonymous body-point numbers, then deleted"); Hoan keeps the replies outside the repo.
