# YardShift 3D

Browser-based 3D gardening simulation. One memorable home garden, discoverable work areas, and tool operations that visually teach a consequence.

**Current playtest path:** P0 continuous lawn mowing (`feature/p0-resource-orchestration-lawn`).

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

## Play loop (P0 lawn)

1. **Garden overview (`/`)** — Saturday morning back garden; soft lawn hotspot.
2. **Confirm** — “Mow this lawn?”
3. **Task stage** — press-drag a **distinct** reel GLB or powered GLB; continuous path cuts; still clicks do nothing.
4. **Return / refresh** — same fine-lawn state on overview (`yardshift-v03`).
5. Legacy v0.2 board at `/legacy`.

See `docs/P0_RESOURCE_DECISIONS.md` and `docs/P0_DEMO_QA.md`.

## Assets & Credits

Full tables: [docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md) · [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) · Gate report: [docs/V03_GATE0_GATE1_REPORT.md](docs/V03_GATE0_GATE1_REPORT.md)

| Resource | Creator | License | Local path |
|---|---|---|---|
| Saturday morning back garden | 3D Assets | CC0 1.0 | `saturday-morning-back-garden.glb` |
| Rusty push reel mower | 3D Assets | CC0 1.0 | `manual-reel-mower.glb` |
| Self-propelled mower | 3D Assets | CC0 1.0 | `mower.glb` |
| Other kit props | 3D Assets | CC0 1.0 | `yardshift-kit/*.glb` |
| Grass 001 textures | ambientCG | CC0 1.0 | `public/assets/textures/grass/` |
| Grass Blade (reference only) | Paul Robello | MIT | *not vendored* |

## Layout

```
src/app/                 Routes (/ garden, /legacy, /yard, /gate0-preview)
src/features/garden/     v0.3 overview + lawn task stage
src/features/yard/       Shared 3D visuals / kit catalog
src/game/work|store      Work-cell engine (v0.2 reused)
src/data/                Equipment, zones, garden scene hide list
docs/                    Specs, manifests, Gate 0–1 report
```

## License

See [LICENSE](LICENSE).
