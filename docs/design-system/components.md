# Components

All components use tokens from `tokens.json`. "States" lists what must be designed; where a state cannot happen, it says so. Hover does not exist on phones (n/a).

## Button (primary / secondary / text)
Purpose: every action. Primary = blue, 72 high, full width, one per screen. Secondary = outlined, 56 high. Text = link style, 56 high touch area.
Variants: primary, secondary, text.
States: default; hover n/a; focus (yellow ring); active (slightly darker, no animation); disabled (50% opacity plus label stays readable); loading (spinner, label kept); error n/a; empty n/a.
Accessibility: role button, Vietnamese label, 56 minimum target.

## Exercise card
Purpose: Home, pick squat, push-up or plank. Large (full width, 96 high) with name at heading size and one-line hint.
Variants: squat, push-up, plank.
States: default; focus; active; disabled n/a; loading n/a; error n/a; empty n/a.
Accessibility: role button, label "Chọn Squat", one tap starts Setup.

## Camera view
Purpose: full-screen live front camera (Setup and Workout). Shows nothing recorded.
States: default (live); loading (black with "Đang mở camera"); error (permission denied: explain and button to open settings; camera busy); empty n/a.
Accessibility: decorative for screen readers; status text is read instead.

## Body outline overlay
Purpose: stick-figure of the body drawn on the camera view. Green solid = correct; red dashed = the wrong body part, rest stays green.
States: tracking-good (all green); tracking-bad (one part red); lost (grey dotted, "Không thấy bạn"); disabled n/a.
Accessibility: stroke 6; color plus dashed shape; wrong part is also named in the cue caption.

## Frame guide
Purpose: Setup. Rectangle on the camera view that turns from white to green when the whole body is inside; arrows/text say "lùi lại" or "sang trái".
States: out of frame (white + guidance text), in frame (green + 2 s hold bar), error (no body detected).

## Cue caption
Purpose: shows the spoken cue as large text at the bottom of the Workout screen (28 bold on scrim). Mirrors the voice (at most one per 2 s).
States: none (hidden), showing a cue (fades after 2 s; no fade under reduced motion), error n/a.
Accessibility: announced politely; not announced twice with the voice.

## Counter (rep count / plank timer)
Purpose: biggest element on Workout: reps as a number, or plank seconds as mm:ss. 120 size, white on scrim.
States: counting; paused (plank, form wrong: dimmed + "Tạm dừng" label); finished; loading/error/empty n/a.

## Countdown
Purpose: 3-2-1 after the user is in frame. Display 64+ number in the centre.
States: 3, 2, 1, go. Reduced motion: number changes instantly.

## Tip card
Purpose: Setup phone-angle tip per exercise (drawing + one sentence).
Variants: squat (front or 45 degrees), push-up (side), plank (side).
States: default; others n/a.

## Score badge
Purpose: Summary. Score 0-100 in a ring, display size. Color: green 80+, yellow 50-79, red under 50 (number also shown, so never color alone).
States: default only.

## Mistake row
Purpose: Summary "Lỗi hay gặp nhất" line; shows "Không có lỗi" when none.
States: with mistake; none (empty).

## History list item
Purpose: one set: date/time, exercise, reps or seconds, score. Min 72 high.
States: default; focus; active n/a (items not tappable in v1); empty (list has none: "Chưa có buổi tập nào" plus button to start); loading (skeleton rows while the database opens); error ("Không đọc được lịch sử", retry button).

## Notice banner
Purpose: the first-launch "not medical advice" note on Home and short errors.
Variants: info (blue edge), warning (yellow edge).
States: default; dismissed (info note is dismissed with a button and not shown again).
Accessibility: role alert for errors, 56 dismiss button.

## Screen header
Purpose: title (title size) and a back button (56 target). Home has a History text button instead of back.
States: default.
