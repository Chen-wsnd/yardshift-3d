# YardShift Asset Manifest

Updated: 2026-11-22 — `feature/p0-resource-orchestration-lawn`

## Textures

| Role | Path | Source | License | Status |
|---|---|---|---|---|
| Ground grass | `public/assets/textures/grass/*` | ambientCG Grass 001 | CC0 | Available; garden overview uses kit scene materials |

## 3D models — Lawn Mowing Simulator Kit (CC0)

Local dir: `public/assets/models/yardshift-kit/`  
Checksums: `SHA256SUMS.txt`  
Pack: https://3dassets.dev/packs/lawn-mowing-simulator-kit

| File | CDN source | SHA-256 (prefix) | Used for |
|---|---|---|---|
| saturday-morning-back-garden.glb | …/27418/v1/model.glb | db81ef30… | **v0.3 overview** (adapted: hide baked lawn/NPCs/mid-job mowers) |
| lawn-uncut.glb | …/27387/v1/model.glb | 22060d94… | Lawn strips (overview + task) |
| lawn-cut.glb | …/27385/v1/model.glb | d0ec6a1e… | Finished / partial lawn strips |
| mower.glb | …/27334/v1/model.glb | 39900e2d… | **Powered mower** (`wheel-roll`, `blade-spin`) |
| manual-reel-mower.glb | …/27333/v1/model.glb | 1a5aaa7d… | **Rusty push reel** (new P0; distinct GLB) |
| hedge-block.glb | …/27390/v1/model.glb | 8a5d6515… | Kit (Gate 2) |
| dandelion.glb | …/27417/v1/model.glb | 91fa59f1… | Kit (Gate 2) |
| picket-fence.glb | …/27388/v1/model.glb | | Kit |
| patio-chair.glb | …/27400/v1/model.glb | | Kit |
| flower-bed-border.glb | …/27392/v1/model.glb | | Kit |
| hedge-trimmer.glb | …/27377/v1/model.glb | dc305ae3… | Kit |
| leaf-rake.glb | …/27371/v1/model.glb | | Kit |
| leaf-blower.glb | …/27379/v1/model.glb | | Kit |
| string-trimmer.glb | …/27378/v1/model.glb | | Kit |
| grass-bag.glb | …/27357/v1/model.glb | | Kit |
| garden-shears.glb | …/27376/v1/model.glb | | Kit |

Registry: `src/features/yard/assets/modelCatalog.ts`  
Hide list / hotspots: `src/data/gardenScene.ts`

## Modifications

- Starter scene: **no mesh edits**; runtime visibility hides unsuitable nodes.
- Overview lawn: baked tiles hidden; kit lawn tiles driven by work-cell state.
- Task stage: mower GLB follows pointer; scale differs for reel vs powered.

## Rejected / deferred

| Item | Status | Reason |
|---|---|---|
| Starter scene as interactive cutter | Rejected | Baked half-mow + hero contradict player state |
| Grass Blade (full) | Rejected as dependency | MIT technique reference only; no code imported |
| Konva | Deferred | Lawn is 3D drag, not 2D erase |
| Turning Seasons leaf pile | Deferred | Gate 2 leaves |
| Kenney Nature Kit | Deferred | Not needed for lawn slice |
