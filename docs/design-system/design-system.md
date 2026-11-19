---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
---

# Design system: Pose Coach

Serves the whole product (`intent/000-product`). Inputs: accepted `spec.md`, `grill.md` Q1, Q5, Q10, Q11. No existing styles in the repo, so every value here is new.

## Direction
**Recommended: dark, high-contrast, "gym display" look.** Near-black background, white text, very large numbers, one accent blue for buttons, green and red reserved only for form feedback. Few words per screen, one main button per screen.
Reason: users stand 2-3 m from the phone, mid-workout, often sweaty and in varied light; the camera picture is the main content and a dark UI does not glare against it. Trade-off: less "friendly" than a light, colorful style; no light theme in v1.

## Tokens
Source of truth: `tokens.json` (color, type, spacing, size, radius, motion). Naming rule: describe the job, not the look (`danger`, not `red`), so values can change without renaming. Green means "form correct" and red means "form wrong" everywhere; they are never used for decoration.
- Color blind users (about 1 in 12 men) may not tell green from red. The outline therefore also changes shape: correct = solid line, wrong = thick dashed line plus a text/voice cue.
- Text sizes: body 18, label 20, title 28, heading 36, display 64, counter 120. Minimum anywhere is 18.

## Components
Inventory lives in `components.md`. Rule for adding one: it must be needed by a screen in the prototype, use only tokens, and list all its states (including "Setup", "Workout" overlay states). No one-off styles inside screens.

## Accessibility rules
- Contrast: WCAG AA minimum (4.5:1 text, 3:1 large text and UI). Every text color pair is recorded in `tokens.json`; the lowest text pair is 6.37:1.
- Touch targets: at least 56 x 56 (primary action 72 high, full width). Reason: hands may be wet; mid-workout taps are inexact. Keep 16 gap between targets.
- Distance legibility: the live numbers (reps, seconds, countdown) use counter/display size. Voice cues are also shown as a caption of 28 or larger.
- Never rely on color alone (see Direction); never on sound alone: every voice cue has a caption, and the app works with sound muted.
- Focus: always visible (3 px yellow ring) for keyboard and screen-reader users.
- Screen reader: every button has a Vietnamese label; the rep count and cues are announced politely, not interrupting the voice cue.
- Keyboard / switch control: every action reachable and operable in a logical order.
- Motion: respect reduced-motion (see `tokens.json`); countdown shows numbers without zoom animation.
- Forms: there are no text fields in v1; the only inputs are buttons.
- Voice: spoken cues at most one every 2 s (spec R10); keep wording under 5 words.

## Decisions
| Decision | Recommended | Reason and trade-off | Hard to change later |
| --- | --- | --- | --- |
| Look | Dark theme only | Readable at distance, kind to the camera view; no light mode to maintain. | No |
| Accent color | Blue `#4D9BFF` for actions; green/red only for form feedback | Keeps the meaning of green/red clean; blue passes contrast on dark. | No |
| Outline for color-blind users | Solid = correct, dashed = wrong, in addition to color | Adds a second signal; slightly more drawing work. | No |
| Type scale | Large (body 18, counter 120) | Readable 2-3 m away; fewer items fit per screen. | No |
| Touch targets | 56 min, 72 for the main button | Easy with wet hands; screens must be simple. | No |
| Token format | One `tokens.json`, loaded into a small theme file in the app | One place to change values; needs a tiny loader. | Medium |
| Fonts | Phone's system font | No download, supports Vietnamese diacritics fully; look differs slightly per phone. | No |
| Icons | Simple built-in shapes/emoji-free line icons drawn in code | No extra library, tiny size; few icons only. | No |

## Open questions
- Brand name/logo and app icon are not decided. Recommended: ship v1 with text name "Pose Coach" and a plain icon; design a logo after the first test release.
