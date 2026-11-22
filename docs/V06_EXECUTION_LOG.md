# YardShift v0.6 Execution Log

**Branch:** `feature/v06-experience-completion`  
**Baseline:** `feature/v06-yardshift-full-experience` @ `f19b6c1`  
**Spec:** `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md`  
**Guidance:** `docs/YARDSHIFT_V06_INTEGRATED_PRODUCT_IMPROVEMENT_GUIDANCE.md`  
**Atlas:** `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md`

## Recovery / protection

| Item | Value |
|---|---|
| External backup (M0–M6) | `/Users/junhanchen/Desktop/yardshift-v06-recovery-20261122-154430` |
| External backup (M7 WIP) | `/Users/junhanchen/Desktop/yardshift-v06-recovery-m7-20261122-155540` |
| Prior delivery HEAD | `f19b6c1` on `feature/v06-yardshift-full-experience` |
| This wave branch | `feature/v06-experience-completion` (from `f19b6c1`) |

## Wave W0–W5 (integrated product improvement)

| Wave | Status | Focus |
|---|---|---|
| W0 | DONE | Protect WIP, branch from `f19b6c1`, copy guidance into `docs/` |
| W1 | DONE | Entry/overview/hotspots/plan/inspect coherence; focusPoint; Finish visit |
| W2 | DONE | Kit GLB tool views via `GardenToolView`; task stages wired |
| W3 | DONE | Yard-wide debris, spatial rework vs potential redirty, independent edge |
| W4 | DONE | Review learning loop (potential vs spent rework), ToolUseGuard lifecycle |
| W5 | DONE | T01–T30 sample coverage, typecheck/lint/test/build, evidence, push feature |

## R01–R14 closure (priority)

| ID | Status | Implementation |
|---|---|---|
| R01 yard-wide debris | DONE | SW path + east-hedge litter fixtures; click debris → focus + task |
| R02 spatial rework | DONE | `spatialRework.ts` — spent rework only on second cleanup of same footprint |
| R03 independent edge | DONE | `edgeSegments` + `edgeFixtures`; review edge % separate from lawn |
| R04 ToolUseGuard | DONE | `toolUseGuard.ts` + store `guardAndConsumeTool` on powered actions |
| R05 whole-yard review | DONE | `reviewSelectors` edge + potentialRedirty + Finish visit |
| R06 kit GLBs in-hand | DONE | `GardenToolView` mounts CC0 kit tools in hedge/debris/edge/flowerbed |
| R07–R11 UX polish | DONE | Hotspots Html, Confirm/Plan/Shell Finish visit, Orbit focus on debris |
| R12–R14 residual | OPEN (P2) | Cosmetic framing, hazard rock GLB, audio — non-blocking |

## Milestone carry-forward (M0–M7)

Prior M0–M7 objective delivery at `f19b6c1` remains; this wave does **not** change L0 core loop — it closes experience gaps on that baseline.

## Engineering verification (this machine)

```
npm run typecheck  → pass
npm run lint       → pass
npm run test       → 97 passed (16 files)
npm run build      → pass
```

## Placement

- Script: `node scripts/inspectGardenScene.mjs`
- Audit: `docs/v06-scene-placement-audit.json` (MEASURED)
- Map: `docs/v06-scene-placement-map.md`
- Registry: `src/data/gardenPlacement.ts`

## Representative browser evidence

- `docs/v06-evidence/01-overview-initial.png`
- `docs/v06-evidence/02-inspect-hazard.png`
- `docs/v06-evidence/03-experience-overview.png` — overview + Finish visit + yard status
- `docs/v06-evidence/04-experience-review.png` — Work review shows Edge ≠ Lawn, spent rework, Finish visit
- Objective pass criteria: Vitest matrix + domain/spatial/edge/lifecycle tests (not screenshots)

## Non-blocking backlog

| Priority | Item |
|---|---|
| P2 cosmetic | Debris camera can still feel patio-heavy on some angles |
| P2 cosmetic | Hazard stone remains overlay (no rock in starter GLB) |
| P3 | Audio, wind grass, brand tool cards |

## Git policy

- Push **feature only** (`feature/v06-experience-completion`); do **not** merge main; do **not** deploy.
