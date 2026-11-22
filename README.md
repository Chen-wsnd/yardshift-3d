# YardShift 3D

Browser-based 3D gardening simulation. One continuous home garden where observation, tool choice, cross-task debris, and work review teach how experienced gardeners organise a job.

**Current playtest path:** V06 final playable closure (`feature/v06-final-playable-closure`) — **global Tool Bar + one continuous yard** (GATE-G). Owner pack: `docs/V06_OWNER_PLAYTEST.md`.

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

## Play loop (V06 · tool-first)

1. **Yard (`/`)** — one continuous Saturday garden; bottom **Tools** bar always available (Hands / Inspect + all work tools).
2. Select a tool, then drag/click matching targets — **no need to enter a TaskStage first**. Area labels only move the camera.
3. Switch tools in place (e.g. shears → rake under the hedge) without leaving the yard.
4. **Causality** — clippings spawn; clean-then-trim creates rework; sealed visit is read-only.
5. **Recharge / Clear jam / Repair** — distinct recoveries on the tool bar.
6. Language: **English / 中文** (key `yardshift-locale`). Persist key `yardshift-v03` (untouched by locale).

Specs: `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` · atlas: `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md` · log: `docs/V06_EXECUTION_LOG.md`

## Known limits (non-blocking)

- Debris / some tools still use readable proxy meshes in-stage (kit GLBs are in-repo).
- Path edge uses **independent** edge segments (not lawn cells).
- Hazard stone is an overlay (starter GLB has no rock node).
- Touch / mobile pointer: limited support this closure; desktop mouse is the verified path.
- Human learning outcome remains `HUMAN_NOT_TESTED` until a person runs the Owner pack.

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
