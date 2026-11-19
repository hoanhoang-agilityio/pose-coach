# Grill: whole product (Pose Coach)

Target: whole product
Scope: product
Status of this log: round 1 answered by Hoan 2026-11-19 ("approve": all 12 recommendations accepted)

Product idea (Hoan): a mobile app that tracks the user's movements and posture live
during a workout, analyzes them in real time and shows feedback in the app.

## Round 1 (questions as asked)

1. Main users. Recommended: people who work out alone at home or at the gym without a coach, age 18-45, beginner to intermediate. Reason: they need form feedback most; trade-off: not aimed at pro athletes.
2. Exercises in v1. Recommended: 3 exercises only: squat, push-up, plank. Reason: do a few really well and measure accuracy; trade-off: small library at launch.
3. Hardware. Recommended: phone only, placed still on the floor/shelf, front camera, full body in frame. No watch or sensors. Reason: everyone has it; trade-off: user must set the phone up once.
4. Platforms. Recommended: iOS and Android from day one with one shared codebase. Reason: reach both markets with one person; trade-off: slightly less native polish.
5. Feedback style. Recommended: automatic rep counting, short voice cues ("go lower", "keep your back straight") plus a color body outline (green ok / red wrong), and a summary after the set. Reason: user is not looking at the screen mid-rep; trade-off: voice needs good wording.
6. Where the analysis runs. Recommended: on the phone only; video never leaves the device. Reason: privacy, instant response, zero server cost; trade-off: limited by phone power. **Hard to change later**
7. Speed target. Recommended: feedback within 0.3 s, at least 20 frames per second on a mid-range phone about 3 years old (e.g. iPhone 11, Galaxy A52). Reason: slower feels laggy; trade-off: rules out heavy models.
8. Data and accounts. Recommended: workout history (reps, form score per set) saved on the phone; no login or cloud in v1. Reason: fastest to ship, no personal data on servers; trade-off: history lost if phone is lost.
9. Money and 90-day success. Recommended: free v1; in 90 days: 50 test users, rep count correct >= 95% of the time, users rate feedback useful >= 4/5. Reason: proves the core works before monetizing.
10. App language. Recommended: Vietnamese first, built so English can be added easily. Reason: first users are in Vietnam; trade-off: small extra setup.
11. Out of scope for v1. Recommended: no live human coach, no social features, no diet plans, no smartwatch, no medical or injury advice. Reason: keeps v1 small and avoids health-claim risk.
12. Team and budget. Recommended: Hoan alone + Claude; budget near zero (only App Store / Google Play developer fees). Reason: matches current setup.

## Log
All answers 2026-11-19: Hoan replied "approve" = accept every recommendation as written.
### Q1. Main users
- Answer/Decision: solo home/gym exercisers without a coach, 18-45, beginner to intermediate.
### Q2. Exercises in v1
- Answer/Decision: squat, push-up, plank only.
### Q3. Hardware
- Answer/Decision: phone only, propped still, front camera, full body in frame.
### Q4. Platforms
- Answer/Decision: iOS + Android from day one, one shared codebase.
### Q5. Feedback style
- Answer/Decision: auto rep count, short voice cues, green/red body outline, per-set summary.
### Q6. Where analysis runs
- Answer/Decision: on-device only; video never leaves the phone. **Hard to change later**
### Q7. Speed target
- Answer/Decision: feedback <= 0.3 s, >= 20 fps on a ~3-year-old mid-range phone (iPhone 11, Galaxy A52).
### Q8. Data and accounts
- Answer/Decision: history (reps, form score per set) on device; no login/cloud in v1.
### Q9. Money and 90-day success
- Answer/Decision: free; 50 test users, rep count correct >= 95%, usefulness >= 4/5.
### Q10. Language
- Answer/Decision: Vietnamese first, i18n-ready for English.
### Q11. Out of scope v1
- Answer/Decision: no human coach, social, diet, smartwatch, medical/injury advice.
### Q12. Team and budget
- Answer/Decision: Hoan + Claude; near-zero budget (store developer fees only).

## Open questions
- Repo: Hoan chose 2026-11-19 to keep artifacts in project files for now; move to a repo (proposed hoanhoang-agilityio/pose-coach) later.

## Round 2: design open questions (answered by Hoan 2026-11-19, "approve" = all recommendations)
- D1. App name and id: "Pose Coach", bundle/package id `com.hoanhoang.posecoach`. **Hard to change later**
- D2. Apple ($99/yr) and Google ($25 once) developer accounts: register when the first test build is needed.
- D3. Speed-check phones: use phones Hoan already has in the iPhone 11 / Galaxy A52 class.
- D4. Test videos: Hoan records ~10 per exercise (correct + each error); consent from anyone else filmed; keep pose JSON only, delete videos.
- D5. Auto-end a set after 5 s out of frame.
- D6. History: "delete all" only in v1.
- D7. Haptics: not in v1.
- D8. Vietnamese cue wording: Hoan reviews in the prototype and edits any that sound unnatural.
