# P0 Demo QA

**Branch:** `feature/p0-resource-orchestration-lawn`  
**Date:** 2026-11-22

## Automated

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

Result: **pass** — 55 tests (includes P0 sweep / tool GLB / reverse / battery / flower once-only / persistence).

## 2-minute human route

1. Open `http://localhost:3000` — full Saturday garden, no rental HUD.
2. Hover lawn (soft highlight) → click → **Mow this lawn?** → Start mowing.
3. Select **Manual Reel Mower**. Click without dragging — grass unchanged.
4. Drag ~2m forward — narrow cut strip + reel wheels/blade animate.
5. Switch to **Battery Self-Propelled** — wider strip; battery % drops.
6. Drag into the right flower border — visible brown damage once.
7. **Back to garden** — same strips/damage on overview.
8. Refresh — state remains (`yardshift-v03`).

## Screenshots

| Shot | Path |
|---|---|
| 1 Initial overview | `docs/p0-screenshots/01-overview-initial.png` |
| 2 Partial path cut | `docs/p0-screenshots/02-lawn-partial.png` |
| 3 Flower damage | `docs/p0-screenshots/03-lawn-damage.png` |
| 4 Back to overview | `docs/p0-screenshots/04-overview-after.png` |

## Remaining subjective / known limits

- Tool-card WebP thumbnails deferred (label buttons used).
- Grass Blade MIT code not copied — footprint is fine-cell InstancedMesh.
- FPS not instrumented in CI; owner should confirm ≥30 FPS on their machine.
- Animation clip timing/orientation may need a one-degree yaw tweak after human play.
- Coarse ambientCG grass texture unused in P0 lawn layer (kit footprint instead).
