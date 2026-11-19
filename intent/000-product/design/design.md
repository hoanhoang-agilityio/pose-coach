---
status: draft        # draft | accepted | rejected (only a human sets accepted)
risk: medium         # low | medium | high
accepted_by:
accepted_at:
requires: [design-system, architecture, data-model, frontend-design, prototype, infra-design, test-strategy]
---

# Design: Pose Coach v1

Inputs: `intent.md` (accepted), `spec.md` (accepted), `grill.md` (Q1-Q12, no open questions).

## Required disciplines
| Skill | Artifact | Why needed (or why skipped) |
| --- | --- | --- |
| `design-system` | `docs/design-system/` | First UI of the product: colors, type, the green/red outline, big touch targets for use mid-workout. |
| `architecture` | `design/architecture.md` + `docs/adr/` | New app: camera -> pose detection -> form rules -> feedback pipeline, and its failure modes. |
| `data-model` | `design/data-model.md` | Set summaries stored on the phone (SQLite), needs a schema and upgrade path. |
| `frontend-design` | `design/frontend.md` | Five screens, live camera overlay, 20 fps budget. |
| `prototype` | `design/prototype.md` + HTML | User-facing flow; Hoan should click through it before code. |
| `infra-design` | `design/infra.md` | How the app is built and shipped to test phones (build service, CI, TestFlight / Play internal testing). |
| `test-strategy` | `design/test-strategy.md` | Always required for medium risk; also defines the recorded pose test data for the 95% target. |
| `api-design` | skipped | No server and no API in v1. |
| `backend-design` | skipped | No server logic in v1. |
| `security-design` | skipped | No `sensitivePaths`, no accounts or network. The camera privacy promise is a requirement (R4, AC3) and is checked in `test-strategy`. |
| `observability-design` | skipped | No production backend; testers' feedback comes through TestFlight / Play testing. Revisit before public release. |

## Artifacts
- design-system: [docs/design-system/design-system.md](../../../docs/design-system/design-system.md), [tokens.json](../../../docs/design-system/tokens.json), [components.md](../../../docs/design-system/components.md)
- architecture: [architecture.md](architecture.md); ADRs [0001](../../../docs/adr/0001-react-native-expo-dev-build.md), [0002](../../../docs/adr/0002-on-device-ml-kit-pose-vision-camera.md), [0003](../../../docs/adr/0003-pure-typescript-form-rules-engine.md)
- data-model: [data-model.md](data-model.md)
- frontend-design: [frontend.md](frontend.md)
- prototype: [prototype.md](prototype.md), clickable [prototype/index.html](prototype/index.html)
- infra-design: [infra.md](infra.md)
- test-strategy: [test-strategy.md](test-strategy.md)

## Cross-cutting decisions
| Decision | Recommended | Reason and trade-off | Hard to change later | Owner artifact |
| --- | --- | --- | --- | --- |
| App framework | React Native + Expo, development build | One codebase, Claude writes it well; needs a custom build for native camera code. | Yes | architecture (ADR) |
| Pose detection | Google ML Kit Pose Detection on device, via react-native-vision-camera frame processor | Free, offline, 33 points, fast; less exact when the body is turned. | Medium | architecture (ADR) |
| Form rules | Pure TypeScript module, no camera or UI imports | Testable on a computer with recorded data; this is the core of the app. | No | architecture |
| Storage | SQLite on the phone (expo-sqlite) | Simple, offline; no sync in v1. | Yes | data-model |
| Language | All strings in one Vietnamese file (i18n library) | English later without code changes. | No | frontend-design |
| Camera angle per exercise | Side view for push-up and plank; front or 45 degrees for squat | Pose points are most reliable from these angles; user must place phone as told. | No | prototype |
| Work order | Rules engine first (with recorded data tests), then camera, then screens | The risky part (accuracy) is proven before UI polish. | No | test-strategy / plan |

## Grill decisions carried
- Q1 users, Q5 feedback, Q10 language, Q11 out of scope -> design-system, frontend-design, prototype.
- Q2 exercises, Q7 speed -> architecture, test-strategy.
- Q3 hardware, Q6 on-device -> architecture.
- Q4 platforms, Q12 team/budget -> architecture, infra-design.
- Q8 data -> data-model.
- Q9 success metric -> test-strategy.

## Open questions
- None blocking. Hoan may edit `requires:` before accepting.
