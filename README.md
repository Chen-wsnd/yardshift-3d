# YardShift 3D

Browser-based 3D gardening simulation. One continuous home garden where observation, tool choice, cross-task debris, and work review teach how experienced gardeners organise a job.

**Current playtest path:** V06 full garden experience (`feature/v06-yardshift-full-experience`).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Three.js / R3F / Drei · Zustand (persisted) · ESLint · Vitest

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `node scripts/inspectGardenScene.mjs` | Measure starter GLB world bounds |

Optional QA overlay: `/?debugPlacement=1`

## Play loop (V06)

1. **Overview (`/`)** — Saturday morning back garden; discoverable hotspots (lawn, hedge, debris, flowerbed; inspect reveals edge/hazards).
2. **Optional** Inspect / Work plan / Work review — plan is not a forced order.
3. **Tasks** — reel vs powered mowing; shears vs hedge trimmer; rake / blower / bag; root pull vs top cut; path edge; hazard clear.
4. **Causality** — hedge clippings spawn on the ground; cleaning then trimming creates visible rework.
5. **Recharge** — empty battery restores via free garden recharge (not a repair).
6. Persist key `yardshift-v03` (legacy `/legacy` keeps `yardshift-v02`).

Specs: `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` · atlas: `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md` · log: `docs/V06_EXECUTION_LOG.md`

## Known limits (non-blocking)

- Debris / some tools still use readable proxy meshes in-stage (kit GLBs are in-repo).
- Edge trim reuses south lawn cells near the measured path.
- Hazard stone is an overlay (starter GLB has no rock node).

## Assets & Credits

[docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md) · [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) · placement: [docs/v06-scene-placement-map.md](docs/v06-scene-placement-map.md)

| Resource | Creator | License | Local path |
|---|---|---|---|
| Saturday morning back garden | 3D Assets | CC0 1.0 | `saturday-morning-back-garden.glb` |
| Rusty push reel / powered mower | 3D Assets | CC0 1.0 | `manual-reel-mower.glb` / `mower.glb` |
| Hedge, dandelion, tools kit | 3D Assets | CC0 1.0 | `yardshift-kit/*.glb` |
| Grass 001 textures | ambientCG | CC0 1.0 | `public/assets/textures/grass/` |
| Grass Blade | Paul Robello | MIT | *REFER_ONLY — not vendored* |

## License

See [LICENSE](LICENSE).
