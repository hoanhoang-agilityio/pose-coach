---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Architecture: Pose Coach v1

Inputs: `spec.md` (R1-R16, AC1-AC12), `grill.md` (Q1-Q12, no open questions), `design.md`.
Plain-language terms: a **frame** is one camera picture; **pose points** are the 33 body points found in a frame; a **frame processor** is native code that sees each frame as it arrives; **fps** is frames per second.
The whole system is one app on one phone. There is no server, no cloud and no account.

## Context (C4 level 1)
```mermaid
C4Context
  title System context: Pose Coach (everything runs on the phone)
  Person(user, "Exerciser", "Props phone up, does squat, push-up or plank")
  System(app, "Pose Coach app", "Counts reps, checks form, speaks cues, keeps history on the phone")
  System_Ext(tts, "Phone voice engine", "Built-in Vietnamese text-to-speech (OS)")
  System_Ext(camera, "Phone camera and ML Kit", "Front camera; Google ML Kit pose model bundled in the app")
  System_Ext(stores, "App Store / Google Play", "Distribution and test releases only")
  Rel(user, app, "Moves, sees outline, hears cues")
  Rel(app, camera, "Reads frames")
  Rel(app, tts, "Speaks short cues")
  Rel(stores, app, "Installs and updates")
```
No network call is made while the app runs (R4, AC3, AC10).

## Containers (C4 level 2)
```mermaid
C4Container
  title Containers inside the app (one process on the phone)
  Person(user, "Exerciser")
  Container_Boundary(app, "Pose Coach app (React Native + Expo dev build)") {
    Container(ui, "Screens and overlay", "React Native, TypeScript", "Home, Setup, Workout, Summary, History; draws green/red outline")
    Container(cam, "Pose capture", "react-native-vision-camera + native frame processor plugin", "Reads frames, runs ML Kit, returns 33 points + timestamp; discards the image")
    Container(engine, "Form-rules engine", "Pure TypeScript", "Points in; rep count, phase, form errors out. No camera, UI, clock or database")
    Container(coach, "Feedback coordinator", "TypeScript", "Turns errors into outline colors and voice cues; 2 s cooldown; countdown; set summary")
    ContainerDb(db, "History store", "expo-sqlite (SQLite file)", "Set summaries only; no images or video")
    Container(i18n, "Strings", "One Vietnamese file", "All text and voice lines")
  }
  System_Ext(tts, "Phone voice engine", "expo-speech")
  Rel(user, ui, "Uses")
  Rel(ui, cam, "Shows live preview")
  Rel(cam, engine, "Pose points + time")
  Rel(engine, coach, "Reps, phase, errors")
  Rel(coach, ui, "Outline state, rep count")
  Rel(coach, tts, "Cue text (Vietnamese)")
  Rel(coach, db, "Saves set summary")
  Rel(ui, db, "Reads history")
  Rel(ui, i18n, "Looks up text")
```
New: everything (new product). The only "outside" parts are the OS voice engine and the on-device ML Kit model.

## Key flows

### Flow 1: live feedback loop (frame -> pose -> rules -> outline + voice)
```mermaid
sequenceDiagram
  participant C as Camera
  participant P as Pose plugin (native, ML Kit)
  participant E as Rules engine
  participant F as Feedback coordinator
  participant O as Outline (UI)
  participant V as Voice (expo-speech)
  C->>P: frame (about 30/s)
  alt previous frame still being processed
    P-->>C: drop this frame (never queue)
  else free
    P->>P: detect 33 points, discard image
    P->>E: points + timestamp
    E->>E: smooth, angles, confirm over 2 frames
    E->>F: reps, phase, errors (body part)
    F->>O: green, or red on the faulty body part
    alt error present and 2 s since last cue
      F->>V: speak Vietnamese cue
    else cooling down
      F->>F: stay silent (outline stays red)
    end
  end
```
Failure path: if confidence is low or the body is out of frame, the engine outputs "not reliable" instead of errors; the outline turns grey, no cue about form is spoken, and the "step back" prompt is used instead (see Failure modes).

### Flow 2: setup and start (R2, R3)
```mermaid
sequenceDiagram
  participant U as User
  participant F as Feedback coordinator
  participant E as Rules engine
  participant V as Voice
  U->>F: opens Setup for chosen exercise
  loop every frame
    E->>F: in-frame yes/no + which side is cut off
    F->>V: "step back" / "move left" (spoken at most every 2 s)
  end
  E->>F: whole body in frame for 2 s
  F->>V: count down 3-2-1
  F->>E: start set (reset counters)
```
Failure path: body leaves the frame during the 2 s hold -> the timer restarts; set does not start.

### Flow 3: end of set -> summary -> SQLite (R12, R13)
```mermaid
sequenceDiagram
  participant U as User
  participant F as Feedback coordinator
  participant E as Rules engine
  participant S as Summary screen
  participant D as SQLite
  U->>F: taps Stop (or leaves frame for 5 s)
  F->>E: end set
  E->>F: reps or hold seconds, per-error counts, form score
  F->>S: show summary
  F->>D: INSERT one row inside a transaction
  alt write fails (disk full)
    D-->>F: error
    F->>S: keep summary on screen + "could not save" message; retry on tap
  end
  U->>S: opens History
  S->>D: SELECT newest first
```

## State and structure
```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Setup: pick exercise
  Setup --> Countdown: whole body in frame 2 s
  Countdown --> Active: 3-2-1 done
  Active --> Paused: body out of frame
  Paused --> Active: back in frame
  Paused --> Summary: out of frame 5 s
  Active --> Summary: user taps Stop
  Summary --> Idle: saved or dismissed
```

## Latency and fps budget (R11, AC8)
Goal: 20 fps or more (one frame every 50 ms) and outline plus voice start within 300 ms of the movement. The two numbers are different: fps is throughput (how many frames per second are analyzed); latency is delay for one movement.

| Step | Budget (ms) | Notes |
| --- | --- | --- |
| Camera capture + delivery to plugin | 35 | Camera at 30 fps; worst case wait for next frame |
| ML Kit pose detection | 50 | The biggest cost; must fit in 50 ms to hold 20 fps. Measure on both phones first |
| Hand points to JavaScript | 10 | Send 33 x 4 numbers only, never the image |
| Rules engine (smoothing, angles) | 5 | Plain arithmetic |
| Confirmation (state must hold 2 frames) | 100 | Prevents flicker; at 20 fps = 2 frames. Deliberate cost; tune per exercise |
| Outline redraw | 20 | One screen refresh |
| Voice cue start (text-to-speech) | 60 | Voice may lag on some phones; outline is the hard 0.3 s guarantee, voice start is measured per phone |
| **Total** | **280** | 20 ms spare |

Rules: drop frames rather than queue them (a queue turns lag into permanent delay). If the measured total on a reference phone goes over 300 ms, reduce the confirmation to 1 frame for the largest errors first, or use the faster ML Kit model.

## Module boundaries
| Module | Owns | May call | Must not call |
| --- | --- | --- | --- |
| `engine` (pure TS) | Angles, smoothing, rep/phase logic, form errors, set summary maths, thresholds config | Nothing outside itself | Camera, React, Expo, SQLite, clock, network |
| `pose` (plugin) | Camera frames, ML Kit call, point format | Native ML Kit | Disk, network, JS storage (images must never leave it) |
| `coach` | Mapping errors to outline/voice, 2 s cooldown, countdown, set lifecycle | `engine`, `tts`, `storage`, `i18n` | Camera directly |
| `tts` | expo-speech wrapper, voice availability check | expo-speech | Engine |
| `storage` | SQLite open, migrations, insert/query | expo-sqlite | Engine, UI |
| `ui` | Screens, outline drawing | `coach`, `storage` (read), `i18n` | `pose` internals, hard-coded text |
| `i18n` | Vietnamese strings (English later) | Nothing | Anything |
Rule enforced by lint and an import check in tests: `engine` imports nothing from the other modules.

## Failure modes
| Failure | Behavior | Recovery |
| --- | --- | --- |
| Body out of frame | Outline grey; voice "step back"/"move left"; during a set the rep logic pauses; timer does not run | Resumes when whole body is back; set ends after 5 s out of frame |
| Low light / blurry | Many low-confidence points; message "need more light" after 3 s of low confidence | Pauses counting; resumes when confidence recovers |
| Low pose confidence (a few points) | Engine ignores rules that depend on those points; never reports an error from a point under the confidence threshold | Fewer cues rather than false cues |
| Low fps / thermal throttling (phone hot) | Detect fps under 15 for 5 s: lower camera resolution, then show "phone is hot, rest a moment"; counting accuracy flagged | Recover when fps returns; set summary notes reduced accuracy |
| TTS Vietnamese voice missing | At first launch and Setup, check installed voices; if none, show on-screen text cues and a "install Vietnamese voice" hint with the OS settings link | Cues continue as large text; app stays usable |
| Camera permission denied | Explain why in plain Vietnamese (camera is only used on the phone, nothing is recorded); button to OS settings; no workout | Re-checks permission when the app returns to the foreground |
| Frame processor crash / camera busy | Show "camera problem, restart"; no half-saved set | Set not saved unless it has at least 1 rep or 5 s hold |
| Database write fails | Summary stays on screen; retry; history untouched | See `data-model.md` |
| App sent to background mid-set | Camera stops (iOS/Android rule); set ends and is saved as partial | User starts a new set |
| Phone call / other app speaks | Voice may be cut off | Outline remains the primary feedback |

## Decisions
| Decision | Recommended | Reason and trade-off | ADR | Hard to change later |
| --- | --- | --- | --- | --- |
| App framework | React Native + Expo dev build | One codebase, Claude writes it well; needs custom build, no Expo Go | `docs/adr/0001-react-native-expo-dev-build.md` | Yes |
| Pose detection | ML Kit on device via vision-camera frame processor, numbers only leave native code | Free, offline, private; less exact at side angles | `docs/adr/0002-on-device-ml-kit-pose-vision-camera.md` | Medium |
| Form rules | Pure TypeScript engine, recorded-data tests | Testable without a phone; one more layer to maintain | `docs/adr/0003-pure-typescript-form-rules-engine.md` | No |
| Frame policy | Drop frames when busy, never queue | Keeps delay under 0.3 s; some frames unused | (this file) | No |
| Voice cooldown | 2 s between cues, kept outside the engine | Meets R10; tunable in one place | (this file) | No |
| Set end | Stop button, or 5 s out of frame | Hands-free ending while exercising; false end possible, so partial sets are saved | (this file) | No |
| Rules run on the JavaScript thread | Yes (not inside the native frame callback) | Keeps engine plain TypeScript; 5 ms work is far below budget | (this file) | No |
| Storage | SQLite via expo-sqlite | See `data-model.md` | n/a | Yes |

## Open questions
- Pose plugin source: use a maintained community vision-camera ML Kit plugin, or write our own small one. Recommended: write our own thin plugin (about 100 lines per platform) after a one-day check of community options, because we need numbers only and control of versions. Blocks: plan, not acceptance.
- Which ML Kit model (base vs accurate) meets 20 fps on the Galaxy A52. Recommended: start with base, switch only if accuracy fails AC5; settled by the first on-phone measurement in `test-strategy`/plan.
- Set auto-end after 5 s out of frame: confirm in `prototype`. Recommended: keep 5 s.
