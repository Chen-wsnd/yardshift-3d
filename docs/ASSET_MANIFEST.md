# YardShift Asset Manifest

Updated: 2026-11-22 (visual pass on `feature/asset-visual-pass`).

| Role | Path | Source | License | Status | Notes |
|---|---|---|---|---|---|
| Ground grass albedo | `public/assets/textures/grass/color.jpg` | [ambientCG Grass 001](https://ambientcg.com/view?id=Grass001) | CC0 1.0 | Integrated | 1K JPG |
| Ground grass normal | `public/assets/textures/grass/normal.jpg` | ambientCG Grass 001 | CC0 1.0 | Integrated | NormalGL |
| Ground grass roughness | `public/assets/textures/grass/roughness.jpg` | ambientCG Grass 001 | CC0 1.0 | Integrated | |
| Ground grass AO | `public/assets/textures/grass/ao.jpg` | ambientCG Grass 001 | CC0 1.0 | Stored | Not wired (uv2); available for later |
| Weeds GLB | — | Poly Haven Weed Plant 02 | CC0 | **Blocked** | Download URL 404 at build time; procedural weed cluster used |
| Hedge / shrub GLB | — | Poly Haven Shrub 02 | CC0 | Not fetched | Procedural rough/tidy hedge used |
| Litter props | — | Fab Street Litter Sampler | Free (site T&C) | Not used | Would require Fab login; reserved as non-objective decor only |
| Fab vegetation / patio / lawn kits | — | Fab listings in `ASSET_MATCHING.md` | Likely paid | **Not purchased** | Explicitly out of scope for this pass |

## Loader policy

- Registry: `src/features/yard/assets/registry.ts`
- Missing / failed textures fall back to procedural ground automatically.
- No GLB dependency for gameplay. Paid packs must not be committed without redistribution rights.

## Attribution

ambientCG Grass 001 is CC0 — attribution not required; recorded for provenance.
