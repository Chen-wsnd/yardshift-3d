# YardShift v0.6 Execution Log

## Current wave — playable learning QA

| | |
|---|---|
| Branch | `feature/v06-playable-learning-qa` |
| Ancestor | `d8eb23c` (`feature/v06-professional-learning-loop`) |
| Contract | `docs/YARDSHIFT_V06_PLAYABLE_LEARNING_PRODUCT_FULL_WAVE.md` |
| Owner pack | `docs/V06_OWNER_PLAYTEST.md` |
| Persist | `yardshift-v03` **not** cleared |

### Wave 0–6

| Wave | Status | Notes |
|---|---|---|
| 0 | DONE | Branched; baseline 112 green; playtest skeleton |
| 1 | DONE | Explicit tool choice (no default Start); scene facts; hotspot labels |
| 2 | DONE | Path samples include origin; guards retained; tool visuals |
| 3 | DONE | Visit seal freezes mutations; Finish idempotent; strict Q22/Q23 |
| 4 | DONE | Softer lawn tiles; flower silhouettes; debris discs |
| 5 | DONE | `playableQa.test.ts`; owner playtest; browser evidence |
| 6 | DONE | Log/manifest/sources; push feature only |

### Gap map

| ID | Status |
|---|---|
| G01 WorkConfirm default | DONE — must pick tool |
| G02 scene ↔ tools | DONE — On site fact + knowledge |
| G03 advice evidence | DONE (prior) + sealed consistency |
| G04 visit freeze | DONE |
| G05 weak J16/17 | DONE — strict Q22/Q23 |
| G06 lawn/debris readability | DONE (one pass) |
| G07 pathLength continuity | DONE — prepend stroke origin |
| G08 hotspots discover | DONE — always-on labels |
| G09 flower vs weed | DONE — petal silhouette |
| G10 browser ops | BROWSER_PASS sample |
| G11 effort labeling | DONE — copy notes game-modeled |
| G12 HUMAN_REVIEW | **HUMAN_NOT_TESTED** |

### Engineering

```
npm run typecheck  → pass
npm run lint       → pass
npm run test       → 119 passed (18 files)
npm run build      → pass
FPS                → NOT_MEASURED
```

### Evidence classes

- `CODE_CONFIRMED` / `AUTOMATED_PASS`: store freeze, rework A/B, pathLength, tool choice rules
- `BROWSER_PASS`: overview + sealed review (see `docs/v06-evidence/07-*.png` if present)
- `HUMAN_NOT_TESTED`: four understanding questions in owner pack

### Prior deliveries retained

- `e4bf150` experience completion
- `d8eb23c` professional learning loop

### Git policy

Push feature only — **no** main merge, **no** deploy, **no** save wipe.
