---
status: accepted        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
source: claude.ai project thread "Start pose-tracking workout app with ai-sdlc kit" (2026-11-19)
originator: Hoan
---

# Intent: Pose Coach, live posture feedback while working out

## What
A free iOS and Android app. The user props the phone up, stands in front of the
camera and does squats, push-ups or a plank. The app counts reps by itself,
watches their posture live and tells them right away, by short voice cues and a
green/red body outline, when form is off ("go lower", "keep your back straight").
After each set it shows a short summary, and keeps a simple history on the phone.
All analysis happens on the phone; video never leaves it.

## Why
People who train alone at home or at the gym (18-45, beginner to intermediate)
have no coach to correct them. Bad form wastes effort and can hurt. Without this,
they keep guessing from mirrors and videos.

## Constraints
- Phone only, front camera, full body in frame; no watch or sensors.
- iOS and Android from day one, one shared codebase.
- Analysis on the device; no video or images sent anywhere. **Hard to change later**
- Feedback within 0.3 s, at least 20 frames per second on a ~3-year-old
  mid-range phone (iPhone 11, Galaxy A52).
- No login and no cloud in v1; history stored on the phone.
- Vietnamese first, ready to add English.
- Team: Hoan + Claude. Budget near zero (App Store and Google Play fees only).
- No medical or injury claims in app text or store listing.

## Success metric
Within 90 days of the first test release:
- 50 people have tested it.
- Rep count is correct in at least 95% of sets (checked against recorded test sets).
- Testers rate the feedback useful at least 4 out of 5 on average.
- Speed target above is met on the two reference phones.

## Out of scope
- Exercises other than squat, push-up, plank.
- Live human coaches, social features, diet plans, smartwatch support.
- Accounts, cloud sync, payments.
- Medical or injury advice.

## Stack proposal
Recommended (one option, Hoan decides):
- **App framework: React Native with Expo.** One codebase for iOS and Android,
  the most common choice, so Claude writes it well and help is easy to find.
  Trade-off: needs a "development build" (not the plain Expo Go app) because
  the camera work uses native code. **Hard to change later**
- **Camera + pose detection: react-native-vision-camera with Google ML Kit Pose
  Detection (on-device).** Reads the camera fast enough for live feedback and
  finds 33 body points per frame, free, offline. Trade-off: rules for "good form"
  are ours to write and tune per exercise.
- **Voice cues:** the phone's built-in text-to-speech (expo-speech), Vietnamese voice.
- **History storage: SQLite on the phone (expo-sqlite).** Simple and offline.
  **Hard to change later** (database engine).
- **Cloud provider:** none in v1.
- **Tests:** Jest for the form rules, which can be checked with recorded pose data
  without a phone.

## Open questions
- None blocking. Risk `medium`: an ordinary new product, no payments or auth;
  camera privacy is handled by keeping everything on the device.
- Hoan to confirm the stack proposal above.
