# YardShift 3D

Browser-based 3D gardening simulation. One memorable home garden, discoverable work areas, and tool operations that visually teach a consequence.

**Current playtest path:** v0.3 Gate 1 lawn vertical slice (`feature/v03-lawn-vertical-slice`).

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

## Play loop (v0.3 lawn slice)

1. **Garden overview (`/`)** — one CC0 residential garden; soft lawn hotspot.
2. **Confirm** — “Mow the front lawn?”
3. **Task stage** — drag a **visible** reel or powered mower; partial strips and flower damage persist.
4. **Return** — overview lawn overlays update from the same work state.
5. Legacy v0.2 board remains at `/legacy` (economy / second job hidden from primary path).

Save key: `yardshift-v03` (does not wipe `yardshift-v02`).

## Assets & Credits

Full tables: [docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md) · [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) · Gate report: [docs/V03_GATE0_GATE1_REPORT.md](docs/V03_GATE0_GATE1_REPORT.md)

| Resource | Creator | License | Local path |
|---|---|---|---|
| Saturday morning back garden | 3D Assets | CC0 1.0 | `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb` |
| Lawn Mowing Simulator Kit parts | 3D Assets | CC0 1.0 | `public/assets/models/yardshift-kit/*.glb` |
| Grass 001 textures | ambientCG | CC0 1.0 | `public/assets/textures/grass/` |
| Grass Blade (technique reference only) | Paul Robello | MIT | *not vendored* |

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
