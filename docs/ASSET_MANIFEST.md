# YardShift Asset Manifest

Updated: 2026-11-22 — `feature/v06-experience-completion` (from `f19b6c1`)

Status legend: `IN_REPO` · `ACTUALLY_USED` · `REFER_ONLY` · `CANDIDATE`

## Textures

| Role | Path | Source | License | Status |
|---|---|---|---|---|
| Ground grass | `public/assets/textures/grass/*` | ambientCG Grass 001 | CC0 | IN_REPO; overview uses kit materials |

## 3D models — Lawn Mowing Simulator Kit (CC0)

Local dir: `public/assets/models/yardshift-kit/`  
Checksums: `SHA256SUMS.txt`  
Pack: https://3dassets.dev/packs/lawn-mowing-simulator-kit

| File | Used for | Status |
|---|---|---|
| saturday-morning-back-garden.glb | Overview + all task stages (shared world) | ACTUALLY_USED |
| lawn-uncut.glb / lawn-cut.glb | Lawn footprint strips | ACTUALLY_USED |
| mower.glb | Powered mower (`wheel-roll`, `blade-spin`) | ACTUALLY_USED |
| manual-reel-mower.glb | Distinct reel GLB (not a scaled powered) | ACTUALLY_USED |
| hedge-block.glb | Hedge overgrowth overlays on east hedge | ACTUALLY_USED |
| dandelion.glb | Weed overlays (measured clump positions) | ACTUALLY_USED |
| flower-bed-border.glb | Kit prop; scene nodes 115/116 locate flowerbed | IN_REPO (scene nodes used) |
| hedge-trimmer.glb / garden-shears.glb | In-hand via `GardenToolView` (hedge/flowerbed) | ACTUALLY_USED |
| leaf-rake.glb / leaf-blower.glb / grass-bag.glb | In-hand via `GardenToolView` (debris) | ACTUALLY_USED |
| string-trimmer.glb | In-hand via `GardenToolView` (edge / top-cut) | ACTUALLY_USED |
| picket-fence.glb / patio-chair.glb | Kit ambience via starter scene | ACTUALLY_USED (in starter) |

Registry: `src/features/yard/assets/modelCatalog.ts`  
In-hand mount: `src/features/garden/GardenToolView.tsx`  
Placement: `src/data/gardenPlacement.ts`, `docs/v06-scene-placement-audit.json`

## Modifications

- Starter scene: **no mesh edits**; runtime visibility hides unsuitable nodes.
- Overview lawn: baked tiles hidden; kit lawn tiles driven by work-cell state.
- Hedge: static GLB base + independent overgrowth overlays (not cube-only).
- Flowerbed: weeds at measured dandelion centres + west border plants.

## Rejected / deferred / refer-only

| Item | Status | Reason |
|---|---|---|
| Starter scene as interactive cutter | Rejected | Baked half-mow + hero contradict player state |
| Grass Blade (full) | REFER_ONLY | MIT technique reference; no code imported |
| Konva | Deferred | Lawn remains 3D drag |
| Turning Seasons leaf pile | CANDIDATE | Instanced leaf proxies suffice for V06 |
| Kenney Nature Kit rock | CANDIDATE | Hazard uses simple overlay; no rock in starter GLB |
