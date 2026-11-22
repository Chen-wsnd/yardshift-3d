# YardShift 3D

Browser-based 3D gardening simulation. Accept yard cleanup jobs, use real-world-inspired tools on interactive targets, earn credits, unlock a second job, and buy advanced equipment.

**v0.1 gameplay** — two playable jobs, eight tools, shop, rewards, persistence, and Reset Demo.

**Visual pass** (`feature/asset-visual-pass`) — CC0 grass PBR ground, upgraded lighting/fence/decor, clearer dirty→clean target visuals, invisible click proxies. See `docs/ASSET_MANIFEST.md`.

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

## Play loop

1. **Task Board (`/`)** — Accept **Overgrown Lawn** (Job 1).
2. **Yard (`/yard`)** — Select a tool, click matching cleanup targets (8 required).
3. **Claim reward** — +500 credits; Job 2 and the shop unlock.
4. **Backyard Restoration** — Advanced tools via shop or demo loaners; 7 targets; +350 credits.
5. **Reset Demo** — Clears progress for a fresh run (persisted in `localStorage`).

## Layout

```
src/app/                 Routes
src/features/jobs/       Task board, completion modal
src/features/yard/       3D scene + interactions
src/features/tools/      Tool dock
src/features/economy/    Balance + shop
src/game/types|store|rules
src/data/                Tools, jobs, yard layouts
docs/                    Architecture, one-shot build, execution log
```

See [docs/CURSOR_ONE_SHOT_BUILD.md](docs/CURSOR_ONE_SHOT_BUILD.md) and [docs/EXECUTION_LOG.md](docs/EXECUTION_LOG.md).

## License

See [LICENSE](LICENSE).
