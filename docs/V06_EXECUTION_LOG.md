# YardShift v0.6 Execution Log

**Branch:** `feature/v06-professional-learning-loop`  
**Baseline:** `feature/v06-experience-completion` @ `e4bf150`  
**Spec:** `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md`  
**Learning contract:** `docs/YARDSHIFT_V06_PROFESSIONAL_TOOL_JUDGMENT_LEARNING_EXECUTION.md`  
**Prior wave:** `docs/YARDSHIFT_V06_INTEGRATED_PRODUCT_IMPROVEMENT_GUIDANCE.md` (historical; do not re-fix R01–R11 as if missing)

## Protection

| Item | Value |
|---|---|
| Prior delivery | `e4bf150` on `feature/v06-experience-completion` |
| This wave branch | `feature/v06-professional-learning-loop` |
| Persist key | `yardshift-v03` (not cleared) |

## Wave A–E (professional tool judgment)

| Wave | Status | Result |
|---|---|---|
| A | DONE | Branched from `e4bf150`, contract copied, baseline 97 tests green |
| B | DONE | `toolKnowledge.ts`; store guards on pull/topCut; honest edger/weeder silhouettes; operable completion weeds |
| C | DONE | Path-length mow effort; `VisitSummary` + compare; event-backed learning advice; Inspect idempotent |
| D | DONE | WorkConfirm explicit tool choice; Review A/B; Finish seals qualityBand; retry keeps history |
| E | DONE | J-matrix tests, typecheck/lint/test/build, browser evidence, push feature |

## Gap closure (A–H from learning contract)

| Gap | Status |
|---|---|
| A wrong tool models | DONE — procedural hand-edger / hand-weeder (J27) |
| B flowerbed store guards | DONE — ToolUseGuard on topCut/pull (J09–J11) |
| C Finish → VisitSummary | DONE — sealed history + compare (J21–J24) |
| D mow effort vs samples | DONE — path-length based productive effort |
| E professional vs finish | DONE — qualityBand; damage blocks “acceptable” |
| F choose-then-act | DONE — WorkConfirm tool picker + knowledge blurbs |
| G visible≠touchable weeds | DONE — completion weeds relocated to operable bed (J12) |
| H browser continuity | DONE — representative evidence below |

## Engineering verification

```
npm run typecheck  → pass
npm run lint       → pass
npm run test       → 112 passed (17 files)
npm run build      → pass
```

## Evidence

- `docs/v06-evidence/01-overview-initial.png` (prior)
- `docs/v06-evidence/03-experience-overview.png` (prior)
- `docs/v06-evidence/04-experience-review.png` (prior)
- `docs/v06-evidence/05-learning-review-advice.png` — qualityBand + event-backed advice
- `docs/v06-evidence/06-learning-visit-compare.png` — sealed Visit summary + A/B section
- WorkConfirm tool picker: CODE_CONFIRMED in `WorkConfirm.tsx` (browser hotspot click flaky under automation)

## HUMAN_REVIEW (not auto-passed)

| Item | Status |
|---|---|
| First 30–60s discoverability | NOT_TESTED |
| Tool judgment after play | NOT_TESTED |
| Process causality understanding | NOT_TESTED |
| Same-yard transfer on retry | NOT_TESTED |

## Suggested 5–8 min owner script

1. Overview → Inspect once → note path edge / hazard cues (not every hazard auto-known).
2. Enter hedge → explicitly pick shears vs powered trimmer → cut one cluster → see clippings.
3. Debris → rake/bag near east; optionally cut again and re-clean for spent rework.
4. Edge after mowing — confirm edge % separate.
5. Flowerbed — string trimmer tops vs hand weeder roots; avoid flowers.
6. Finish visit early → read qualityBand + advice with event ids.
7. Try again (same yard) → change one choice → Finish → read A/B compare.

## Non-blocking backlog

| Priority | Item |
|---|---|
| P2 | J02–J05 full path-length matrix across sample densities (partial via code) |
| P2 | Hazard rock GLB; debris camera framing |
| P3 | Audio, wind grass, brand tool cards |
| P3 | FPS measurement — NOT_MEASURED |

## Git policy

- Push **feature only**; do **not** merge main; do **not** deploy; do **not** wipe `yardshift-v03` saves.
