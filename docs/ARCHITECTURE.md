# Architecture — YardShift 3D

## Goals

- Keep Phase 0 small, runnable, and easy for parallel hackathon work.
- Prefer clear folders over deep abstractions.
- Separate **domain types**, **pure rules**, **client state**, **feature UI**, and **3D rendering**.

## Dependency direction

```
app/pages  →  features/*  →  game/store + game/rules + data
                 ↓
            game/types   (leaf — no imports from features/app)
```

Rules:

1. `game/types` must not import from features, components, or app routes.
2. `game/rules` must stay pure (no React, no Zustand, no Three.js).
3. `features/yard` owns WebGL; other features must not import `three` directly.
4. Feature modules may import `game/*` and `data/*`, not each other’s internals (use public `index.ts` exports when cross-feature UI is needed).
5. Avoid circular imports between features.

## Components

| Component | Responsibility |
| --- | --- |
| **App Router** (`src/app`) | Pages, layout, fonts, metadata. Yard page loads Canvas with `dynamic(..., { ssr: false })`. |
| **Layout / UI** | Header, shell, buttons — presentation only. |
| **Jobs** | Task board, accept job CTA, link into yard. |
| **Yard** | Procedural ground, fence, objects; OrbitControls; R3F Canvas. |
| **Tools** | Tool list, selection, educational copy. Interaction logic is placeholder. |
| **Economy** | Balance indicator; ownership/rewards live in types + store. |
| **Tutorial** | Empty in Phase 0; reserved for Developer C. |
| **Store** | Zustand: player, jobs, tools, yard, progress + accept/select actions. |
| **Rules** | e.g. `canAcceptJob` — unit-tested without React. |
| **Data** | Sample job, yard, tools, player — local only. |

## 3D / SSR notes

Three.js and `@react-three/fiber` require a browser. The yard route:

1. Marks the page as a client component.
2. Loads `YardCanvas` via `next/dynamic` with `ssr: false`.

Do not import `YardCanvas` from a Server Component without the dynamic wrapper.

## Shared contracts

Defined in `src/game/types`:

`Player`, `Job`, `JobStatus`, `Yard`, `YardObject`, `GardeningTool`, `ToolCategory`, `ToolInteractionResult`, `Reward`, `GameProgress`.

When changing these, coordinate with the Integrator and update sample data + tests in the same PR when possible.

## State shape (Phase 0)

```
player: Player
jobs: Job[]
tools: GardeningTool[]
yard: Yard
progress: GameProgress  // activeJobId, selectedToolId, …
```

Actions today: `acceptJob`, `selectTool`, `enterYardForActiveJob`. Progression/shop transactions are deferred.

## Module ownership

| Owner | Paths |
| --- | --- |
| Developer A | `src/features/yard/**`, `public/assets/**` |
| Developer B | `src/features/jobs/**`, `tools/**`, `economy/**`, `src/game/rules/**`, `src/data/**` |
| Developer C | `src/components/**`, `src/app/**`, `src/features/tutorial/**` |
| Integrator | `src/game/types/**`, `src/game/store/**`, docs, CI/integration |

Cross-cutting changes (types/store) go through Integrator review before merge to `main`.
