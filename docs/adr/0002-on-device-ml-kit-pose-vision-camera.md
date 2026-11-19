---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# ADR 0002: On-device ML Kit Pose Detection through a react-native-vision-camera frame processor

## Context
We need 33 body points per camera frame, at 20 fps or more on an iPhone 11 and a Galaxy A52, with no network and no video leaving the phone (R4, R11, Q6). A "frame processor" is a small piece of native code that sees each camera frame as it arrives, before anything is saved or shown.

## Decision
We will use **react-native-vision-camera** to read camera frames and a **frame processor plugin that calls Google ML Kit Pose Detection** (stream mode, accurate or base model chosen by measurement). The plugin returns only numbers: 33 points (x, y, z, confidence) plus a timestamp. The frame image is dropped inside native code and never reaches JavaScript, disk or network.

Reason: free, offline, runs on the phone's own chip, same Google model on both platforms. Trade-offs: less exact when the body is turned sideways, and ML Kit gives no "pose quality" beyond per-point confidence, so our rules must handle noise. Expect a small own plugin (about 100 lines per platform) if no maintained community plugin fits; see Open questions in `architecture.md`.

## Consequences
- Good: privacy by design (only numbers leave the camera layer), no server cost, works in flight mode.
- Bad: depends on two third-party libraries that update often; we must pin versions.
- Harder: swapping the pose model later means changing only the plugin, because the rules engine takes plain points (ADR 0003). **Hard to change later:** medium.

## Alternatives considered
- MediaPipe Pose / TensorFlow Lite MoveNet directly: comparable accuracy, more setup for each platform; keep as fallback if ML Kit misses the fps target.
- Apple Vision + Android-only library: two different models give two different behaviors to tune.
- Send video to a server: better models, but breaks the privacy promise, adds lag and cost (rejected in spec).
