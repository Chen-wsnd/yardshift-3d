# P0 Resource Decisions — Gate A

**Branch:** `feature/p0-resource-orchestration-lawn`  
**Base:** `feature/v03-lawn-vertical-slice` @ `c10772d`  
**Date:** 2026-11-22

## Verified downloads

| Role | Asset | Local path | SHA-256 | Magic | Anims | Decision |
|---|---|---|---|---|---|---|
| Overview garden | Saturday morning back garden | `saturday-morning-back-garden.glb` | `db81ef30…` | glTF | none | **Reuse** (hide baked lawn/NPCs) |
| Manual reel | Rusty Push Reel Mower | `manual-reel-mower.glb` | `1a5aaa7d87a5ef444854126620c6cc005b1bab64fcd1513e5c54b9e6b16a0198` | glTF | `blade-spin`, `wheel-roll` | **Accepted — newly downloaded** |
| Powered mower | Self-Propelled Mower w/ bag | `mower.glb` | `39900e2df87a68c2646cbd64abf1f0a619bba54336d03955a43317d06857a5b7` | glTF | `wheel-roll`, `blade-spin` | **Reuse** (not a scaled reel) |
| Lawn uncut tile | kit | `lawn-uncut.glb` | `22060d94…` | glTF | none | Tile is **3 fused meshes** — not blade-separable → use fine footprint layer |
| Lawn cut tile | kit | `lawn-cut.glb` | `d0ec6a1e…` | glTF | none | Same — LOD/decor only |
| Flower border | kit | `flower-bed-border.glb` | `53967a97…` | glTF | none | Gate C protected edge |

### Reel mower (R2) details

- Source: https://3dassets.dev/assets/lawn-mowing-simulator-kit-rusty-push-reel-mower-a7e5847b
- CDN: https://cdn.3dassets.dev/assets/27333/v1/model.glb
- License: CC0 1.0 · Creator: 3D Assets
- Bytes: 36332 · nodes: 16 · meshes: 11
- Named parts: `cutting-reel`, `wheel-side-left/right`, `wheel-roller`
- Download: HTTP 200, local magic `glTF`, clips present in binary JSON chunk

### Powered mower (R3) details

- Source: https://3dassets.dev/assets/lawn-mowing-simulator-kit-self-propelled-mower-with-gr-19515d26
- Local: existing `mower.glb`
- Named parts: four wheels + `blade`
- Clips verified in local binary: `wheel-roll` (4 channels), `blade-spin` (1)

### Animation policy

| Tool | wheel-roll | blade-spin |
|---|---|---|
| Manual reel | only while advancing | only while advancing |
| Powered | while moving | while enabled (dragging + battery > 0) |
| Idle / click-no-move | stopped | stopped |

**No fake differentiation by scale** — both models render at natural ~1.0 scale; silhouette and bag/reel geometry distinguish them.

## Rejected / deferred

| Candidate | Reason |
|---|---|
| Scale-only dual mower | Forbidden by P0 — same GLB different scale |
| Full Grass Blade app | Architecture mismatch; MIT `vegetationFall` studied, **not copied** |
| Konva 2D erase | Not a real 3D mower path |
| Retail brand photos | Licensing risk; tool cards use model-preview / label fallback |
| Separating lawn-uncut into blade instances | Mesh not separable → fine-cell footprint renderer instead |

## Raw inspect dump

See `docs/p0-glb-inspect.json`.
