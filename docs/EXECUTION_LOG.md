# YardShift — Execution Log

## v0.2 — `feature/v02-garden-work-sim`

| Part | Status | Evidence |
|---|---|---|
| Master spec | done | `docs/YARDSHIFT_V02_CURSOR_MASTER.md` |
| Work engine | done | `src/game/work/*`, durability/quality rules |
| Two residential layouts | done | Maple Lane + Willow House zones/scenes |
| Tools / rent / repair | done | equipmentProfiles + store ledgers |
| Focused drag work | done | FocusedWorkView + cell proxies |
| CC0 kit GLBs | done | 14 models in `public/assets/models/yardshift-kit/` |
| Tests | done | 39 pass (15 work acceptance + store + legacy) |
| typecheck/lint/build | done | pass |
| Push | pending | no merge / no deploy |

### Deferred for product-owner playtest
- Camera comfort, brush feel, GLB scale polish
- Style unify grass PBR vs stylized kit
- Optional chainsaw/herbicide depth beyond abstract states
- Wire more kit props into overview (chair/fence GLB already on disk)

### Blockers
- None for local playtest. Vercel still unauthenticated (out of scope).

## Prior
- v0.1 on `main` @ `30a0eaa`; visual pass on `feature/asset-visual-pass` @ `5aeb387`
- Persist keys: `yardshift-v01` (untouched), `yardshift-v02` (new)
