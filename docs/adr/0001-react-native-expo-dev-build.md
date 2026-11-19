---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# ADR 0001: React Native + Expo (development build) for the app

## Context
Pose Coach must run on iOS and Android from one codebase (R1), with a tiny team (Hoan + Claude) and near-zero budget. The camera and pose detection need native code, so the plain Expo Go app (a ready-made test shell) cannot be used.

## Decision
We will build the app with **React Native and Expo using a development build** (a custom test app that contains our native camera and pose code). Language: TypeScript. Builds are made with Expo's build service or locally.

Reason: it is the most common cross-platform choice, so Claude writes it reliably and help is easy to find. Trade-off: native camera/ML code adds setup work, and we cannot test the camera in Expo Go or on a computer.

## Consequences
- Good: one codebase, one language, shared rules engine and screens, over-the-air text fixes possible later.
- Bad: a slower first setup; every native library change needs a new build; camera work can only be tested on real phones.
- Harder: moving to two separate native apps later means a rewrite of all screens.
- **Hard to change later:** yes.

## Alternatives considered
- Two native apps (Swift and Kotlin): best speed, but doubles the work and the bugs for a two-person team.
- Flutter: also cross-platform, but a smaller pool of ready camera + ML Kit libraries and less familiar to Claude for this stack.
- Expo Go only: cannot load native camera and pose code.
