---
status: accepted        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Spec: Pose Coach v1, live posture feedback

Sources: `intent/000-product/intent.md` (accepted), `intent/000-product/grill.md` (Q1-Q12).
Terms: a "rep" is one full repetition (down and up); a "set" is a group of reps
done in one go; "pose points" are the 33 body points (shoulders, hips, knees...)
the phone finds in each camera frame.

## Requirements

### Setup and camera
1. The app must run on iOS and Android from one codebase (Q4).
2. Before a set, the app must show a live front-camera view and tell the user, by
   text and voice, when their whole body is not in frame ("step back", "move left").
3. The set must not start until the whole body has been in frame for 2 seconds;
   then the app counts down 3-2-1 by voice.
4. Camera frames and video must never be saved to disk or sent over the network (Q6).
   The app must work with no internet connection at all.

### Exercises and rep counting (Q2)
5. The user must be able to pick one of exactly three exercises: squat, push-up, plank.
6. For squat and push-up the app must count reps automatically and show the count
   on screen and say it by voice.
7. For plank the app must time how long correct form is held, and pause the timer
   while form is wrong.
8. Rep count must match a human count in at least 95% of sets in the test video set
   (see Acceptance criteria) (Q9).

### Posture feedback (Q5)
9. The app must draw a body outline over the camera view: green when form is
   correct, red on the body part that is wrong.
10. The app must give short Vietnamese voice cues for these form errors, at most
    one cue every 2 seconds so it is not noisy:
    - Squat: not deep enough; knees caving in; chest falling forward.
    - Push-up: hips sagging; hips too high; not going low enough.
    - Plank: hips sagging; hips too high.
11. Feedback (outline color and voice cue start) must appear within 0.3 s of the
    movement, and pose detection must run at 20 frames per second or more on an
    iPhone 11 and a Galaxy A52 (Q7).

### Summary and history (Q8)
12. After each set the app must show: exercise, reps (or plank seconds), a form
    score from 0 to 100 (share of reps or time with correct form), and the most
    common mistake.
13. Each set summary must be saved on the phone and listed in a History screen,
    newest first. History must survive closing and reopening the app.
14. There must be no login, account or cloud sync.

### Language and wording (Q10, Q11)
15. All text and voice must be in Vietnamese; every string must come from one
    translation file so English can be added without code changes.
16. The app must not give medical or injury advice. The first launch shows a short
    note: "Pose Coach gives form tips, not medical advice."

## Design
Recommended approach (decisions; details belong to the `design` stage):
- **App: React Native + Expo (development build)**, one codebase for both phones.
  Reason: most common cross-platform choice, so Claude writes it reliably and help
  is easy to find. **Hard to change later**
- **Camera + pose: react-native-vision-camera reading frames, Google ML Kit Pose
  Detection on the phone** returns pose points per frame. Reason: free, offline,
  fast enough for 20+ fps on mid-range phones.
- **Form rules engine: plain TypeScript, no camera inside.** Input: a stream of
  pose points. Output: rep count, current phase (down/up), form errors. Rules use
  joint angles (for example knee angle under 100 degrees = deep enough squat).
  Reason: the rules can be tested on a computer with recorded pose data, without a
  phone. This is the heart of the app.
- **Voice: expo-speech** (phone's built-in Vietnamese voice). **Outline:** drawn on
  top of the camera view.
- **Storage: expo-sqlite on the phone**, one table of set summaries. **Hard to
  change later** (database engine).
- Screens: Home (pick exercise) -> Setup (get in frame) -> Workout (live) ->
  Set summary -> History.

Rejected alternative: sending video to a server for analysis. Better models, but
breaks the privacy promise, adds lag and server cost (Q6).

## Policies applied
- `.sdlc/policies/` has no rule files yet, so no project policy applies.
- Kit rules from `CLAUDE.md` apply: no app code before an accepted plan; one branch
  `feat/000-product`.

## Acceptance criteria
- [ ] AC1 (R1): the app installs and opens on an iOS device and an Android device from the same code.
- [ ] AC2 (R2, R3): with the user half out of frame, the app asks them to move and does not start; once fully in frame for 2 s it counts down.
- [ ] AC3 (R4): with flight mode on, a full workout works; a check of the app's files and network log shows no image or video data.
- [ ] AC4 (R5): only squat, push-up and plank can be picked.
- [ ] AC5 (R6, R8): on a test set of recorded pose data (at least 30 sets per exercise, counted by a human), the rep count is exact in at least 95% of sets (automated test).
- [ ] AC6 (R7): plank timer runs while form is correct and pauses while hips sag (automated test on recorded data).
- [ ] AC7 (R9, R10): for each listed form error, recorded data with that error triggers the right cue and red body part; correct data triggers none; cues are at least 2 s apart (automated tests).
- [ ] AC8 (R11): on an iPhone 11 and a Galaxy A52, measured pose detection is 20 fps or more and feedback delay is 0.3 s or less.
- [ ] AC9 (R12, R13): after a set, the summary shows reps/seconds, score and top mistake; after restarting the app it is in History, newest first.
- [ ] AC10 (R14): no sign-in screen or network request for accounts exists.
- [ ] AC11 (R15): all visible text comes from the Vietnamese translation file (automated check for hard-coded strings).
- [ ] AC12 (R16): the first launch shows the "not medical advice" note.

## Risks and unknowns
- **Recorded test data:** AC5-AC7 need recorded pose data of real people doing each
  exercise, right and wrong. Recommended: Hoan records about 10 short videos per
  exercise; we turn them into pose data once and keep only the numbers, not the
  video. To settle in `test-strategy`.
- **Accuracy at side angles:** ML Kit is less exact when the body is turned. The
  setup step should ask for a fixed angle per exercise (side view for push-up and
  plank, front or 45 degrees for squat). To settle in `prototype`.
- **Vietnamese voice quality** differs between phones; to check early on both
  reference phones.
- **Reference phones:** Hoan needs access to an iPhone 11 and a Galaxy A52 (or
  similar) for AC8.
- Risk stays `medium`: no payments, no accounts, camera data never leaves the phone.
