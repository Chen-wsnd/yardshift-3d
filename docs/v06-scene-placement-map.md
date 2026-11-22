# V06 Scene Placement Map

**Evidence only** — not a second product spec.  
**Measurement:** `node scripts/inspectGardenScene.mjs` → `docs/v06-scene-placement-audit.json`  
**Code registry:** `src/data/gardenPlacement.ts` → `gardenTasks.ts` / `garden/fixtures.ts`

| Area | Source nodes (MEASURED) | Hotspot center | Provenance | Player-visible entity |
|---|---|---|---|---|
| lawn | P0 `LAWN_FINE` (−5,−4)×10×8 | (0, 0.05, 0) | P0_LAWN_GRID | Fine cells + Saturday garden (lawn tiles hidden) |
| hedge | `055–059-hedge-block-2m`, `062-hedge-corner` @ x≈7 | (6.4, 0.05, 1) | MEASURED+MANUAL_OFFSET (−0.6 X) | Static hedge GLB + overgrowth overlays (`hedge-block.glb`) |
| flowerbed | `115/116-flower-bed-border-piece` @ (−6.3, ~2.25); dandelions 111–114 | (−6.3, 0.08, 2.25) | MEASURED | West border + weed overlays (`dandelion.glb`) |
| edge | path slabs `064–078` SW; strip on lawn–path band | (0, 0.05, −3.6) | MEASURED+MANUAL_OFFSET | South lawn cells near path |
| debris | Initial near path; clippings from hedge `sourceActionId` | (−3.0, 0.05, −4.2) | MEASURED+MANUAL_OFFSET | Sphere piles / gathered stacks |
| hazard | Overlays (no rock in starter GLB) | (−3.6, 0.08, 3.1) | MANUAL overlay | Stone + hedge hardwood markers |

## Misalignment risks (non-blocking)

- GLB lawn tiles are hidden; work grid is synthetic but spatially intended to match kit metres.
- Flowerbed is west (shed side); P0 protected flower *cells* remain on east lawn columns — both valid, different systems.
- Hedge overlays use kit `hedge-block.glb` scaled as overgrowth, not per-leaf geometry.

## Debug

Open `/?debugPlacement=1` for translucent hotspot boxes (`SceneRegistrationDebug`).
