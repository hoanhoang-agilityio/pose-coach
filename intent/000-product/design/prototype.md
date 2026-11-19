---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Prototype: Pose Coach v1

Open `design/prototype/index.html` in a browser (double-click it). Artifact link: none yet (can be published as a private artifact on request). Figma: none (offered once; not pushed).
Inputs: accepted `spec.md`, `grill.md`, `docs/design-system/tokens.json`. All text in the prototype is Vietnamese.

## How to click through
Home -> pick an exercise -> Setup. On Setup press "Mô phỏng: trong khung" and wait 2 seconds; the 3-2-1 countdown runs, then Workout starts. On Workout, the count rises by itself; press "Mô phỏng: sai tư thế" to see the red dashed body part and the cue caption (plank timer pauses), "Mô phỏng: đúng" to go back to green. Press "Dừng" to see the Summary, which is added to History at the top. The right-hand panel jumps to any screen and switches empty/error History and the first-launch note.

## Flows to acceptance criteria
| Flow / screen | Acceptance criterion | Demonstrates |
| --- | --- | --- |
| S1 Home: exactly 3 exercise cards | AC4 | Only squat, push-up, plank can be picked. |
| S1 Home: "not medical advice" banner on first launch, dismiss button | AC12 | Note text from spec R16 (Vietnamese). Shown once. |
| S1 Home: History link | AC9 | Entry point to saved sets. |
| S2 Setup: "out of frame" state with guidance ("Lùi lại một chút") and no countdown | AC2 | App asks the user to move and does not start. |
| S2 Setup: "in frame" holds 2 s (progress bar), then 3-2-1 | AC2 | Start only after 2 s in frame. |
| S2 Setup: phone-angle tip per exercise (front/45 for squat, side for push-up and plank) | AC2 (setup), spec risk "side angles" | Resolves the angle question as a visible instruction. |
| S3 Workout: rep count (squat, push-up) and plank timer in seconds | AC5, AC6 | Big counter; plank pauses (dimmed + "Tạm dừng") while form is wrong. |
| S3 Workout: green solid body outline, red dashed on the wrong part (knees or hips) | AC7 | Color plus shape, so color-blind users also see it. |
| S3 Workout: voice-cue caption, at most one per 2 s | AC7 | Caption mirrors the voice; the prototype has no sound. |
| S3 Workout: large type for 2-3 m viewing | AC8 (readability only) | Real 20 fps and 0.3 s speed cannot be shown here. |
| S4 Summary: reps or seconds, score 0-100, top mistake ("Không có lỗi" when none, zero-rep case) | AC9 | All items of spec R12. |
| S5 History: newest first, plus empty and error states | AC9 | Saved set appears at top; survives restart is a real-app test. |
| All screens: every visible string is Vietnamese; no login | AC10, AC11 | No sign-in screen exists. AC11 (strings in one file) is checked in code, not here. |
| Not visible in a prototype | AC1, AC3, AC8 | iOS/Android install, flight-mode and network check, speed on phones: tested on devices. |

## Mock data
- Exercise names, tips, cue wording and the "typical mistake" per exercise: object `EX` at the top of the script.
- History rows (4 sets) and the demo summary values (squat 8 reps score 82, push-up 74, plank 45 s): `history` array and `finish()` in the script.
- "Mô phỏng" buttons stand in for the camera and the form-rules engine. Counting is a timer, not a real detection.
- Summary after a real click-through uses the time spent in "sai tư thế" to compute the score.

## Tokens used
Source: `docs/design-system/tokens.json`, copied as CSS variables on `:root`. Values not from tokens: phone frame size (390 x 780, a typical phone), the figure drawings and the 160 px countdown number (larger than any scale step so it can be read from afar; proposed as a new token `type.scale.countdown` in the design system if accepted).

## Not covered
- Real camera, pose detection, voice and speed; the body outline here is a fixed drawing.
- Camera-permission-denied and "body lost" screens (described in `frontend.md`).
- Landscape, tablets, light theme, large-font-setting behaviour.
- Haptics, sound.

## Decisions
| Decision | Recommended | Reason and trade-off |
| --- | --- | --- |
| Screen order | Home -> Setup -> Workout -> Summary -> History, as in the spec | Matches the accepted spec; no extra screens. |
| Camera placeholder | Dark picture with a stick-figure drawing and "Mô phỏng" buttons | Lets you feel the flow without a camera; looks less real than a video mock. |
| Cue shown as caption as well as voice | Yes | Gym noise or muted phone; also needed for hearing-impaired users. Takes a little screen space. |
| "Tập tiếp" button on Summary | Yes, goes back to Setup of the same exercise | Fewer taps between sets; not required by the spec. |
| "Đã hiểu" button on the medical note | Yes, hides it for good | Stops nagging; the note must still be seen on first launch (AC12). |
| Plank score | Share of time with correct form | Same wording as spec R12 for reps. |

## Open questions
- Exact wording of Vietnamese voice cues is draft ("Mở gối ra", "Siết bụng, nâng hông", "Nâng hông lên"). Recommended: Hoan (native speaker) reviews the cue list once; then test them on both reference phones.
- Squat and push-up names in the UI: "Squat" kept as is, push-up as "Hít đất". Recommended: keep these; change only if testers find them unclear.
