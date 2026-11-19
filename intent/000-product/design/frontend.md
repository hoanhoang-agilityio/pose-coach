---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Frontend design: Pose Coach v1

Inputs: accepted `spec.md`, `design.md`, `grill.md` (Q1, Q4, Q5, Q7, Q8, Q10), `docs/design-system/`, `prototype.md`. This is a phone app, so "route" means a screen and "bundle" means app size.
Terms: **state** = data the screen remembers while it runs; **frame** = one camera picture; **JS thread** = the single lane where app logic runs (if it is busy, the screen stutters).

## Routes and screens
| Route | Screen | Prototype ref |
| --- | --- | --- |
| `/` | Home: pick exercise, History link, first-launch note | S1 Home |
| `/setup/[exercise]` | Setup: camera, get in frame, phone tip, 3-2-1 | S2 Setup |
| `/workout/[exercise]` | Workout: live count, outline, cue caption | S3 Workout |
| `/summary` | Set summary (shown after a set; saved first) | S4 Summary |
| `/history` | History list, newest first | S5 History |

Navigation: Expo Router (file-based screens). Workout replaces Setup in the back stack, so Back from Summary goes Home, never into a live camera.

## Component tree
```text
App (theme + i18n provider, new)
  Home (new)
    NoticeBanner (design system)   ExerciseCard x3 (design system)   Button text "Lịch sử"
  Setup (new)
    CameraView (design system)  FrameGuide (ds)  TipCard (ds)  Countdown (ds)  Button
  Workout (new)
    CameraView  BodyOutline (ds, drawn with Skia)  Counter (ds)  CueCaption (ds)  Button "Dừng"
  Summary (new)
    ScoreBadge (ds)  MistakeRow (ds)  Button x2
  History (new)
    ScreenHeader (ds)  HistoryItem (ds) list  empty / error views
```
Non-visual modules (no UI imports, built in other changes): form-rules engine, pose reader (camera -> pose points), voice speaker, database. Screens only call them through small hooks (`usePose`, `useWorkout`, `useSpeech`, `useHistory`).

## State
| State | Where it lives | Why |
| --- | --- | --- |
| Chosen exercise | Route parameter | Survives reload of a screen; no global store needed. |
| Setup status (out of frame / in frame for N s / counting down) | Local to Setup, small state machine | Only Setup cares. |
| Live pose points and outline color | Not React state; kept in a fast shared value read by the drawing layer | At 20 frames per second, React re-draws would overload the JS thread and break the 0.3 s budget. **Hard to change later** (shapes the whole workout screen) |
| Rep count, phase, plank seconds, current errors | Form-rules engine output, copied to React state only when the number or text changes (a few times per second at most) | Keeps screens calm and fast. |
| Last cue time | Voice speaker module | Enforces "one cue per 2 s" in one place (spec R10). |
| Finished-set result | Passed from Workout to Summary after being saved | Summary shows exactly what History will show. |
| History rows | SQLite, read on opening History | One source of truth; survives restarts (AC9). |
| "Note seen" flag | Small stored setting | First-launch note shows once (AC12). |

## Data fetching and caching
No network and no API (spec R4, R14; `api-design` skipped). The only data source is the phone's database via `design/data-model.md` (to be drafted).
- Read History fresh each time the screen opens; list is small (hundreds of rows), so no cache.
- Save the set before navigating to Summary; if saving fails, still show Summary with a "Không lưu được" notice.
- Camera frames are processed in memory and dropped; nothing is written to disk (R4).

## Forms and validation
No text fields in v1. Only buttons, so no validation. The only "input checks" are automatic:
| Check | Rule | Message |
| --- | --- | --- |
| Body in frame | All needed pose points visible with good confidence for 2 s | "Lùi lại một chút", "Dịch sang trái/phải", "Đã thấy bạn, giữ yên" |
| Camera permission | Must be granted | "Cần quyền camera để theo dõi tư thế" + button to open settings |

## Error, empty and loading states
| Screen | Error | Empty | Loading |
| --- | --- | --- | --- |
| Home | Never blocks; if storage fails, History link still opens and shows its own error | n/a | n/a |
| Setup | Permission denied; camera in use; no body found after 10 s ("Không thấy bạn, kiểm tra góc đặt máy") | n/a | "Đang mở camera" |
| Workout | Body lost for 3 s: pause count/timer, grey outline, caption "Không thấy bạn"; pose model fails: stop and offer retry | n/a | n/a (starts after countdown) |
| Summary | Save failed: notice, data still shown | Zero reps: "Chưa đếm được lần nào", no score, suggests checking phone angle | n/a |
| History | "Không đọc được lịch sử" + retry | "Chưa có buổi tập nào" + start button | Skeleton rows |

## Accessibility and i18n
- Follows `docs/design-system/design-system.md`: 56 minimum targets, big type, caption for every voice cue, color plus dash shape.
- Focus order: top to bottom; main button last. Screen reader reads count changes politely; cue captions are marked so they are not read twice.
- i18n: all text in one file `locales/vi.ts`, accessed through a translation function (i18next with react-i18next). Plural and number formats go through the library. An automated check fails the build on any hard-coded visible string (AC11). Spoken cues use the same file. Dates use `vi-VN`. Right-to-left is not needed.
- Screen stays awake during Setup and Workout; portrait only in v1 (see Open questions).

## Performance budget
Bundle: app download under 60 MB (mostly the pose model and native camera code). Startup: Home visible within 2 s on a Galaxy A52. Interaction: tap response under 100 ms. Live path: 20 fps or more pose detection, outline and cue within 0.3 s of the movement (AC8); drawing on the native side, not through React re-renders; no more than 4 React updates per second on Workout. Memory: no frames kept.

## Decisions
| Decision | Recommended | Reason and trade-off |
| --- | --- | --- |
| Screen navigation | Expo Router | Standard with Expo, simple file-per-screen; less flexible than hand-built navigation. |
| Fast drawing of the outline | react-native-skia, driven from the camera frame handler | Draws at camera speed without slowing the app; adds one native library and ~6 MB. |
| Live data outside React state | Yes (shared values) | Needed for 20 fps; makes the Workout screen code slightly more specialised. **Hard to change later** |
| State library | None; local state + route params + hooks | Five simple screens do not need one; add one only if a screen grows. |
| i18n library | i18next + react-i18next, single `vi.ts` | Mature, English later by adding `en.ts`; small setup cost. **Hard to change later** (string keys appear everywhere) |
| Orientation | Portrait only | Matches the phone-propped-upright setup and simplifies the overlay; wide exercises (squat sideways) still fit. |
| Keep screen awake | On during Setup and Workout | Phone must not sleep mid-set; uses a little more battery. |
| Dark theme only | Yes | See design system. |
| Tests | Jest + React Native Testing Library for screens; engine tested separately with recorded data | Screens tested with fake pose data; real camera checked by hand on the two phones. |

## Open questions
- Portrait vs landscape for the squat: landscape would fit a full body better at short distances. Recommended: portrait in v1, re-test with real videos in the rules-engine step and revisit only if frame-in-view fails.
- Haptic (vibration) feedback in addition to voice: not in spec. Recommended: skip in v1.
