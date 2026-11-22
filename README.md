# YardShift 3D

Browser-based 3D gardening simulation for a Sundai Club hackathon. Players browse yard cleanup jobs, enter an interactive backyard, select gardening tools, and learn real-world equipment purposes through play.

**Phase 0** establishes the project foundation: module boundaries, shared types, a navigable dashboard + procedural 3D yard, and collaboration docs. Full gameplay loops come in later phases.

## Stack

| Layer | Choice |
| --- | --- |
| App framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| Client state | Zustand |
| Language | TypeScript (strict) |
| Quality | ESLint, Vitest |

No database, auth, backend API, or payments in Phase 0 — all game data is local.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |

## Routes

| Path | Feature |
| --- | --- |
| `/` | Dashboard / task board — sample job, Accept Job, navigate to yard |
| `/yard` | Client-only 3D backyard + tool selector + balance |

## Project layout

```
src/app/              Routes (dashboard, yard)
src/components/ui/    Shared UI primitives
src/components/layout/ App chrome (header, shell)
src/features/jobs/    Task board & job cards
src/features/yard/    3D scene (client-only Canvas)
src/features/tools/   Tool selection UI
src/features/economy/ Balance display
src/features/tutorial/ Reserved for onboarding (Phase 1+)
src/game/types/       Shared domain contracts
src/game/store/       Zustand game state
src/game/rules/       Pure rules / validation
src/data/             Local sample data
public/assets/        Future models, textures, audio
docs/                 Architecture, roadmap, contributing
```

## Team ownership

| Role | Owns |
| --- | --- |
| Developer A | `features/yard` — 3D environment & interactions |
| Developer B | `features/jobs`, `tools`, `economy`, `game/rules` |
| Developer C | `components/*`, `app/*` navigation/UI, `features/tutorial` |
| Integrator | `game/types`, `game/store`, PRs, integration |

Do not change another module’s internals without coordination. Shared type and store changes need review before merge.

Suggested branches: `feature/yard-interactions`, `feature/jobs-economy`, `feature/ui-dashboard`, `feature/tutorial-system`.

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/ROADMAP.md](docs/ROADMAP.md).

## License

See [LICENSE](LICENSE).
