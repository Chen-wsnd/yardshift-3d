# YardShift Asset Manifest

Updated: 2026-11-22 — `feature/v02-garden-work-sim`

## Textures

| Role | Path | Source | License | Status |
|---|---|---|---|---|
| Ground grass | `public/assets/textures/grass/*` | ambientCG Grass 001 | CC0 | Integrated (may clash with stylized kit; deferred style unify) |

## 3D models — Lawn Mowing Simulator Kit (CC0)

Local dir: `public/assets/models/yardshift-kit/`  
Checksums: `SHA256SUMS.txt`  
Pack: https://3dassets.dev/packs/lawn-mowing-simulator-kit

| File | CDN source | SHA-256 (prefix) | Used for |
|---|---|---|---|
| lawn-uncut.glb | …/27387/v1/model.glb | 22060d94… | Lawn dirty cells |
| lawn-cut.glb | …/27385/v1/model.glb | d0ec6a1e… | Lawn finished cells |
| hedge-block.glb | …/27390/v1/model.glb | (see SUMS) | Hedge segments |
| dandelion.glb | …/27417/v1/model.glb | 91fa59f1… | Weed/decor fallback |
| picket-fence.glb | …/27388/v1/model.glb | | Scene kit (available) |
| patio-chair.glb | …/27400/v1/model.glb | | Scene kit (available) |
| flower-bed-border.glb | …/27392/v1/model.glb | | Scene kit (available) |
| mower.glb | …/27334/v1/model.glb | 39900e2d… | Catalog / future HUD |
| hedge-trimmer.glb | …/27377/v1/model.glb | dc305ae3… | Catalog |
| leaf-rake.glb | …/27371/v1/model.glb | | Catalog |
| leaf-blower.glb | …/27379/v1/model.glb | | Catalog |
| string-trimmer.glb | …/27378/v1/model.glb | | Catalog |
| grass-bag.glb | …/27357/v1/model.glb | | Catalog |
| garden-shears.glb | …/27376/v1/model.glb | | Catalog |

Registry: `src/features/yard/assets/modelCatalog.ts`  
Fallbacks: procedural `WorkCellVisuals` / `HouseFacade` when GLB fails.

## Not integrated (recorded, not blockers)

- Preassembled starter scene GLB — used only as spacing reference; not imported wholesale
- Poly Haven plants — prior 404; not retried
- Paid Fab packs — out of scope
- Kenney suburban house — procedural facade used instead
