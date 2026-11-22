# YardShift v0.6 Execution Log

**Branch:** `feature/v06-yardshift-full-experience`  
**Base:** `feature/p0-resource-orchestration-lawn` @ `cc5853f`  
**Spec:** `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md`

| Milestone | Status | Commit | Evidence | Risk / follow-up |
|---|---|---|---|---|
| M0 | DONE | (pending) | `rechargeRules.test.ts`; `applyWear({drainResource:false})`; Recharge UI in GardenShell | — |
| M1 | DONE | (pending) | `src/game/garden/*`, `gardenTasks.ts`, hotspots, overlays | Spatial bounds approx vs GLB |
| M2 | DONE | (pending) | Hedge clusters + shears/trimmer; clippings spawn under hedge | Proxy meshes, not per-leaf GLB |
| M3 | DONE | (pending) | Rake/blow/bag; review rework after clean-then-trim | Blower scatter → rework |
| M4 | DONE | (pending) | Inspect + hazard clear; optional Work plan | Soft block near uncleared stone/wood |
| M5 | DONE | (pending) | Flowerbed root vs top; edge strip | Edge reuses lawn cells |
| M6 | DONE | (pending) | Work Review from events | No fixed order penalty |
| M7 | IN_PROGRESS | | Screenshots + notices + delivery | — |

## Decisions

| Decision | Reason | Parent-level impact | Reversal |
|---|---|---|---|
| Persist key stays `yardshift-v03` with nested `garden` domain | Avoid wipe; migrate in place | L5 | Can bump schema if needed |
| Garden recharge is free setup/recovery effort (no credits) | Spec F04 / M0 | L0–L3 | — |
| Lawn stone placed NW corner (-3.6, 3.1) | Discoverable without blocking centreline mow tests | L2 | Move if GLB alignment needs it |
| Hedge/debris/plants as domain overlays on Saturday garden | Reuse GLB; mutable state separate | L5/L6 | Swap to kit props later |

## Test snapshot

- `npm test`: 67 passed
- `npm run typecheck`: pass
- `npm run lint`: pass

## Non-blocking leftovers

- Hedge/debris/flower interactions use proxy meshes + overlays (readable causality > film-quality art)
- Edge trim still shares lawn cell authority (acceptable for v0.6)
- No audio; camera polish limited
- Scalped toast may still surface from legacy stroke path in edge cases
