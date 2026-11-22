# YardShift v0.3 — Gate 0 + Gate 1 report

**Branch:** `feature/v03-lawn-vertical-slice`  
**Base:** `feature/v02-garden-work-sim` @ `a534333`  
**Authoritative plan:** `docs/YardShift_v03_reuse_first_execution_brief.md`

## Gate 0 — resource fit

### Imported

| Asset | Local path | SHA-256 | License | Notes |
|---|---|---|---|---|
| Saturday morning back garden | `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb` | `db81ef30…` | CC0 1.0 | 1.57 MB, 636 nodes, 284 meshes, **0 animations** |

Page: https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene  
CDN: https://cdn.3dassets.dev/assets/27418/v1/model.glb

### Visual / hierarchy findings

- Recognizable residential back garden (fence, hedges, shed, patio, greenhouse, swing).
- **Baked half-mowed lawn** (`*-lawn-tile-2m-striped|uncut|cut`) contradicts player-driven before→partial→after.
- **Baked characters** (mowing hero, dog walker, neighbour, perfectionist, teen, delivery driver) and **mid-job mowers** (self-propelled, robot, giant mega) fight the learning loop.
- Named nodes are clear enough to hide cheaply; four future hotspots (lawn / hedge / flower / leaves) can be placed by bounds.

### Decision

**ACCEPT as overview scene with adaptations** (not as the interactive lawn surface):

1. Hide narrative characters, mid-job mowers, leaderboard, and all baked lawn tiles (`src/data/gardenScene.ts`).
2. Overlay state-driven kit `lawn-uncut` / `lawn-cut` strips from the v0.2 work cells.
3. Interactive mowing uses existing kit `mower.glb` + lawn tiles in `LawnTaskStage`.

Isolated preview: `/gate0-preview` (toggle raw vs adapted).

### Rejected (this gate)

| Resource | Reason |
|---|---|
| Starter scene as interactive lawn surface | Fixed cut/uncut stripes + hero mid-stripe cannot represent player state |
| Grass Blade full app | Complete arcade game; adaptation cost > extracting concepts; MIT kept as technique reference only — **no code copied** |
| Konva / react-konva | Not needed for lawn mowing (3D drag + GLB is the fit) |
| Turning Seasons leaf pile | Deferred to Gate 2 leaves task |
| Kenney Nature Kit | Not required for lawn slice |
| Paid Fab / stock photos | Out of scope |

## Gate 1 — lawn vertical slice (implemented)

### Player loop

`/` Garden overview → soft lawn hotspot → confirm → `LawnTaskStage` (visible mower, reel vs powered) → partial/damaged results → back to updated overview.

### Engine reuse

- Preserved `applyWorkAction`, durability/quality rules, cell progress, once-only `damageKeys`.
- New persist key `yardshift-v03` (does **not** wipe `yardshift-v02`).
- Economy / second residence retained in source; primary UI hides them (`/legacy` for v0.2 board).

### Tools

| Tool | Behavior |
|---|---|
| Manual reel mower | Narrow radius, slower throttle, precision 0.75 |
| Powered lawn mower | Wider radius, faster throttle, precision 0.55 (risks flower border) |

Both granted in garden mode (no rental UI).

### Adaptations required

- Hide list for unsuitable starter-scene nodes.
- Overview lawn overlays replace baked tiles.
- Pointer displacement → `direction` (fixes v0.2 constant `[1,0]` in focused work).
- Dev script without Turbopack (Google font module resolution failure).

### Remaining limitations (owner playtest)

- Overview hotspot is soft tint, not invisible until hover-only (tunable).
- Other three activities (hedge / flower / leaves) intentionally not built.
- Grass Blade cut-mask not ported; strip visuals use kit GLBs + partial overlay.
- Camera / brush feel deferred as subjective.

## Tests run

See CI-local: `npm run typecheck && npm run lint && npm run test && npm run build`.
