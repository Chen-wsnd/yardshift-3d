# YardShift v0.6 Execution Log

**Branch:** `feature/v06-yardshift-full-experience`  
**Base:** `feature/p0-resource-orchestration-lawn` @ `cc5853f`  
**Spec:** `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md`  
**Atlas:** `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md`

## Recovery

| Item | Value |
|---|---|
| External backup (M0–M6) | `/Users/junhanchen/Desktop/yardshift-v06-recovery-20261122-154430` |
| External backup (M7 WIP) | `/Users/junhanchen/Desktop/yardshift-v06-recovery-m7-20261122-155540` |
| Checkpoint 1 | `46c481b` — `wip(v06): checkpoint recovered M0-M6 implementation` |
| Checkpoint 2 | `0c97e0e` — `wip(v06): checkpoint M7 placement wiring and sweepSamples fix` |

## Milestone status

| Milestone | Status | Code / evidence | Notes |
|---|---|---|---|
| M0 | DONE | `durabilityRules.applyRecharge`, Shell Recharge, `rechargeRules.test` + objective matrix | Free recharge; not repair |
| M1 | DONE | `src/game/garden/*`, `gardenTasks`, hotspots, overlays | Persist `yardshift-v03` + nested garden |
| M2 | DONE | Hedge clusters on measured east hedge; clippings spawn | Overlays use `hedge-block.glb` |
| M3 | DONE | rake/blow/bag; rework from spawn-after-clean | Objective A/B review test |
| M4 | DONE | Inspect / hazard soft-block / optional plan | Plan not authoritative |
| M5 | DONE | Root vs top; edge near measured path | Edge reuses lawn cells (known limit) |
| M6 | DONE | Work Review from events | No fixed order penalty |
| M7 | DONE (objective) | Placement audit + matrix tests + representative screenshots | Subjective UX left to owner |

## Blocker fixed in M7

| Bug | Fail condition | Fix |
|---|---|---|
| `performWorkAction` dropped `sweepSamples` / `forwardMotion` | Continuous mow via store → “No work under the tool stroke” | Forward both fields in `gameStore.ts` |

## Engineering commands (this machine)

```
npm run typecheck  → pass
npm run lint       → pass
npm run test       → 89 passed (13 files)
npm run build      → pass (recorded on final commit)
```

## Placement

- Script: `node scripts/inspectGardenScene.mjs`
- Audit: `docs/v06-scene-placement-audit.json` (MEASURED)
- Map: `docs/v06-scene-placement-map.md`
- Registry: `src/data/gardenPlacement.ts`

## Representative browser evidence (not pass criteria)

- `docs/v06-evidence/01-overview-initial.png`
- `docs/v06-evidence/02-inspect-hazard.png`
- Additional interactive verification done via store/CDP during session (reel cut, recharge, hedge clippings, review rework 3.6 from spawn-after-clean). Further screenshots deferred per owner guidance.

## Non-blocking backlog

| Priority | Item |
|---|---|
| P2 cosmetic | Debris/task tool proxies vs full kit GLB in-hand models |
| P2 cosmetic | Debris camera framing can feel patio-heavy |
| P2 | Edge completion still shares lawn cell authority |
| P2 | Hazard stone is overlay (no rock in starter GLB) |
| P3 | Audio, wind grass, brand tool cards |

## Git policy

- Push **feature only**; do **not** merge main; do **not** deploy.
