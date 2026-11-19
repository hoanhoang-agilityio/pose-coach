---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# ADR 0003: Pure TypeScript form-rules engine, isolated from camera and UI

## Context
Rep count accuracy (95% target, AC5), plank timing (AC6) and correct cues (AC7) are the heart of the product. They must be proven on a computer, with recorded data, long before a phone is involved.

## Decision
We will write the rules as a **pure TypeScript module** (`src/engine/`): no imports from the camera, React, Expo, the clock or the database. It is a function of its inputs only.
- Input: a stream of frames, each = timestamp + 33 points (x, y, z, confidence), plus the chosen exercise.
- Output per frame: rep count, phase (for example up/down/hold), list of form errors with the body part at fault, and "in frame / confident" flags.
- At the end of a set: a summary (reps or hold seconds, per-error counts, score).
- Voice-cue spacing (2 s cooldown) lives in a separate small module that takes the engine's errors and a time, so it is also testable.
Rules use joint angles with smoothing and a short confirmation (a state must hold for 2 frames) to avoid flicker. Thresholds live in one config file per exercise so they can be tuned without touching logic.

Reason: testable with Jest on recorded pose data (numbers only, no video), fast to iterate, reusable if the pose model changes. Trade-off: one extra translation layer between the plugin and the engine, and a recorded dataset must be produced and kept up to date.

## Consequences
- Good: AC5-AC7 become automated tests; engine bugs are found without phones.
- Bad: recording and labelling data is real work (about 10 videos per exercise, turned into numbers once).
- Rule: the engine receives time from the data, never reads a clock, so a replay is exactly repeatable. **Hard to change later:** no.

## Alternatives considered
- Rules written inside the camera or UI code: cannot be tested without a phone.
- A machine-learning classifier for form: needs far more labelled data than we can collect; rules are explainable ("knee angle under 100 degrees").
