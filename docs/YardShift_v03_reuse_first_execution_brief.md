# YardShift v0.3 — Reuse-first execution brief (DECIDED PLAN)

**Date:** 2026-11-22  
**Starting point:** `Chen-wsnd/yardshift-3d`, branch `feature/v02-garden-work-sim`, commit `a5343338492e452f41e82dc025e8c0b81e2c1187`.  
**Status:** Design/selection brief only; NOT implemented, NOT sent to Cursor, no GitHub changes made.

## 0. Product thesis / 用户目标

**One memorable home garden, four discoverable work areas, and tool operations that visually teach a consequence.**

The player enters a coherent garden overview, selects a natural-looking area (no permanently visible neon grid), confirms a task, enters a specialized close-up activity, uses a genuinely differentiated tool, sees changes immediately, can make a persistent mistake, and returns to see the change in the same garden. There is no need for multiple homes, task unlock chains, or money grinding.

**Hard rule: Reuse an existing scene or operation when it is *compatible with the learning action*, not merely when it looks good.** A single lawn image is suitable for navigation, not sufficient to teach a reel mower versus a powered mower. Garden shears are for shrub/hedge detail, NOT normal lawn mowing.

## 1. Non-negotiable decisions / 产品取舍

- **One residential garden**. Retain v0.2 second yard and finances in source for backwards compatibility; hide both from the primary play path, do not remove them.
- **Overview is a visual navigator**. Default candidate: a fixed three-quarter view of a reusable CC0 **3D** starter scene; if its hierarchy cannot be separated well, render a fixed camera image from it, keeping the same scene's composition. This preserves the hackathon's 3D-world connection without requiring that every interaction run in the overview.
- **Task experiences may be different renderers**: R3F/Three for grass movement; same-style GLB assets + simple segment/cut animation for hedges; Canvas/Konva when it provides superior 2D leaf grouping or flower selection. Each task reads/writes the existing `yardshift-v02` work state (or one clearly-versioned extension).
- **One vertical slice first: lawn**, then hedge, flowerbed, leaves. Do not develop all four fully before human validation of the lawn slice.
- **Tool mechanics are not merely brush-size differences**. They must vary in movement constraints, targeted material, operating speed, and risk. Most core work is done by player's pointer movement/drag rather than one-click completion.
- Keep **damage persistent** and **repairs reachable**, but hide cash/rent menus unless the owner explicitly opens an optional toolbox screen.
- No unlicensed paid packs; no assumption that a free download allows GitHub redistribution. Document CC0/required notices and credit creator even if attribution not required.

## 2. Selected resource set / 明确选材（不是无目标搜索）

| Role | Primary choice and actual URL | Confirmed from source | What still must be checked locally |
|---|---|---|---|
| Overview scene | **Saturday morning back garden** — https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene ; GLB https://cdn.3dassets.dev/assets/27418/v1/model.glb | Provider says CC0, dimensions ~15.0 × 4.4 × 17.7m, 37.1k triangles, 1.6MB, **zero animations** | Downloadability, hierarchy, baked characters and half-mowed lawn, positions of four usable hotspots; whether static pre-cut grass would contradict player state |
| Existing lawn operation visuals | Existing committed `public/assets/models/yardshift-kit/lawn-uncut.glb`, `lawn-cut.glb`, `mower.glb`; source pack https://3dassets.dev/packs/lawn-mowing-simulator-kit | Confirmed already in v0.2 Git branch, CC0 manifest | Render at consistent scale; smooth transition; look for repeated-tile artifacts |
| Grass cutting technical reference | **Grass Blade** https://github.com/paulrobello/grass-blade , license https://github.com/paulrobello/grass-blade/blob/main/LICENSE | MIT license, persistent cut trail, instances and grass cutmask described | It is a complete arcade game, NOT drop-in R3F widget. Extract isolated concepts only if adaptation is cheaper than current renderer. Do not import its full app or dependencies. |
| Hedge tool & target | Existing `hedge-block.glb`, `garden-shears.glb`, `hedge-trimmer.glb` | Files already committed under CC0 kit | `hedge-block` is a **pre-clipped hedge**. Must create overgrowth layer by reusing foliage meshes/clusters, so before/after is distinguishable. If insufficient, test CC0 shrub from Kenney, but do not add incompatible realistic materials without review. |
| Flower / weed | Existing `dandelion.glb`, `flower-bed-border.glb`, `string-trimmer.glb` | Already in repo | Make flower and weed independent pickable entities, show both unhurt and destroyed variants (not just a number). |
| Leaf pile & seasonal plants | **Turning Seasons: Four Season Garden** https://3dassets.dev/packs/turning-seasons (contains **Fallen leaf pile**) | Provider says CC0, each model separate | Download only leaf-related props needed, check same low-poly visual palette; if it clashes, use existing style-consistent sprites/meshes, not a whole different scene |
| 2D strokes, masks, input | **Konva + react-konva**, https://github.com/konvajs/konva ; React erase example https://konvajs.org/docs/react/Free_Drawing | MIT licensed; reusable input/drag/masking via canvas compositing | Only for genuinely suitable 2D activities. Canvas masking alone is NOT a mower or a shear simulator. |

**Do NOT use unverified assets in production.** Website listing/CC0 claim verified; local GLB binary import and visual suitability beyond the 14 committed assets have NOT yet been tested in this investigation.

**Rejected by default:** ad-hoc stock photos for each task (camera mismatch), paid Fab assets, standalone Grass Blade as a direct whole-game dependency, photo-real shrubs next to flat cartoon kit, a second custom residential scene.

## 3. Backward design from four user-visible learning outcomes

### A — Lawn / mowing (first and only required immediate implementation)

**Learn:** A reel mower has narrow controlled passes; a powered mower is faster and covers more space. Both are meant for grass, and careless movement at planted boundaries can harm nearby non-grass plants. Scissors are *not* offered as a substitute for mowing.

**Interaction:** Start from one coherent grass strip close-up. Pointer drag pushes a **visible** mower along a path; cut occurs immediately behind tool footprint; a strip of tall grass becomes short grass; partial passes remain visible. Manual reel = narrow pass and controlled speed; powered mower = wider pass and faster motion, with charge/condition. Player cannot instantly clear whole field by clicking one location. If a path leaves lawn into a protected flower border, show persistent plant damage and reduce quality once per incident.

**Rendering choice:** Prefer existing CC0 mower + uncut/cut lawn GLBs. Use the current R3F scene and v0.2 work-cell engine to project discrete work to visible, smaller lawn segments. Study Grass Blade's trail/cut-mask for improving transitions, but copy only a scoped, license-compliant module if practical. Do not spend the entire pass porting its gameplay architecture.

**First-pass acceptance:** visible moving tool; 3+ separately affected strips; manual/powered visually different; partially cut persists through exit/re-entry; one mistake persists; homeowner overview shows where lawn changed.

### B — Hedge / clipping (second pass, gated by A acceptance)

**Learn:** Manual hedge shears allow controlled small trims; powered hedge trimmer covers long stretches but is less forgiving near flowers/obstacles.

**Interaction:** A side-on or 3/4 close-up of one hedge. Source hedge is pre-clipped: surround it with independently removable small same-style leafy overgrowth pieces. Short repeated shearing marks trim one clump; powered sweep cuts a larger band. Incorrect excessive sweep creates an ugly permanent notch (do not just recolor the entire hedge). Entangled woody section can jam tool, with optional clear-jam action. The tool model visibly moves and stops.

**Acceptance:** before really looks overgrown; distinct partial and trimmed silhouettes; powered/hand difference; visible bad notch and jam, persistent on return.

### C — Flowerbed / weeding (third pass)

**Learn:** Weeding selectively removes unwanted plants, and indiscriminate trimmer use can leave roots or damage flowers.

**Interaction:** Flower and weed models are separate, distinguishable interactive meshes/sprites. Hand weeder selects/removes weed after a short pull gesture; string trimmer moves quickly but leaves stubble and risks flowers. Selecting an actual flower can destroy that plant. No generic 'green patch disappears'.

**Acceptance:** protected flower stays when weeding properly, is visibly damaged by a mistake, other weeds remain untouched; re-entry persists.

### D — Leaves / collect (fourth pass)

**Learn:** Rake/blower gather leaves; bagging removes them. Wrong blow direction scatters leaves.

**Interaction:** Separate small leaf sprites/mesh instances move toward a visibly growing pile in the direction of rake sweep; powered blower affects larger cone and can move leaves into another zone when aimed badly; explicit bag interaction removes only gathered pile. Konva canvas is acceptable if 3D particles add cost without clarity.

**Acceptance:** leaves visibly move with pointer direction, pile grows, bagging visibly removes, scattering creates extra work.

## 4. User-facing screen structure (no overgrown UI)

`/` → `GardenOverview` (one large 3D scene or its captured view, four invisible/soft-highlight zones) → click → short `WorkConfirm` (e.g., “Trim the side hedge?”) → `TaskStage` full-height specialized interaction (task-specific asset/renderer) → back to `GardenOverview` with changed local patch/artwork. A small bottom/tool-side selector + optional inspect/repair drawer replaces giant progress and cash overlays. User can switch tasks without settlement gates. Tool state shared.

**Overview-to-task visual continuity:** Each hotspot is anchored in a named garden region. Every task stores `before/partial/good/bad` summary for that region. Map this back to a fitted local decal/mesh/image crop in the overview; do not assume unrelated close-up photographs seamlessly composite into scene.

## 5. Exact engineering touch points

- Preserve and adapt `src/game/work/{types,engine,selectors}.ts`, `src/game/store/gameStore.ts`; retain one-time accident/repair and cell-progress semantics.
- Replace the player-facing use of `src/features/yard/ResidentialYard.tsx` and `ZoneHotspots.tsx` with overview composed from chosen asset, not a second procedural house.
- Replace current `FocusedWorkView.tsx` (which passes constant direction `[1,0]`) with `TaskStage` component; use actual pointer displacement for directional work.
- Reuse `src/features/yard/assets/modelCatalog.ts` and add provenance-rich model metadata.
- Replace oversized HUD in `src/app/yard/page.tsx`; no settlement bar covering the upper third of gameplay.
- Keep v0.2 task board/economy in source but route new users to garden overview. Never destroy saves silently; introduce versioned new save or explicit migration backed by tests.

### Strict order of operations and stop/go checkpoints

**Gate 0: 20-minute maximum resource fit check** (budget target, not a promise of completion). Import complete garden GLB in isolated preview; screenshot it; inspect GLTF node names and bounding boxes; identify whether 4 hotspots are easy to place; reject starter scene if fixed mower/characters/half-mowed grass make it unsuitable and cannot be hidden cheaply. In that case choose a still camera frame from the 3D asset for overview or assemble *only* pre-existing CC0 kit models. List exact used resources and license before writing new geometry.

**Gate 1: lawn vertical slice**. Put one chosen garden overview in the app with lawn hotspot; enter interactive mower task; visibly move tool and change strips; return to visibly modified overview; record a visible mistake. Human playtest now. Do NOT continue to all other zones automatically if A feels like a rubber eraser or a hidden-grid counter.

**Gate 2: complete remaining three tasks** only after owner accepts the lawn loop. Implement hedge, weed, leaves in the above order using the chosen asset/operation match; reuse input/state modules where sensible.

**Gate 3: polish and ship**. Confirm visual coherent style, UI hierarchy, no camera dead space, no broken input, save persistence, library/attribution. The product owner evaluates learning and fun; unit tests cover state invariants.

## 6. Definition of done

- Player visually recognizes **a residential garden** without reading task IDs.
- All main actions can be started with one click + confirmation, no task unlock or money requirement.
- Work stage covers most viewport; visible selected tool actually moves under player control.
- At least two tools exhibit materially different *behavior* for one task (not only icons or numeric progress).
- Intermediate, complete, and damaged results are independently obvious **on screen**; no number-only results.
- Persistent results visible from the overview; reload retains them.
- No one-stroke clearing of whole task, no giant sky area, no oversized HUD obscuring the work.
- The existing model assets really render and move as intended, not merely appear in catalog.
- Automated checks: typecheck, lint, tests, build; include targeted tests for persistence, directional input, damage once-only, and no financial double-charge in hidden legacy system.
- Git commit + branch only (not merge `main`), and README **Assets & Credits** + `docs/ASSET_MANIFEST.md` + `docs/THIRD_PARTY_NOTICES.md` correctly enumerate every externally sourced asset/code with creator, URL, license, exact modifications, local path, and required notices. Respect asset-specific restrictions.

## 7. Failure criteria / stop conditions

- A selected asset cannot physically represent before→partial→after→mistake: **reject it as an interaction source** even if pretty. It can still be used as static decor.
- A library integration takes longer than extracting a known working technique or introduces a second application architecture: reject the integration and adapt only the smallest reusable part.
- A visually unconvincing asset pack combination: use matching subsets, not every free asset available.
- An operation is simply click-on-cell→clean with no visible tool feedback: not accepted.
- Do not implement more tasks as a workaround for an unconvincing lawn loop.

## 8. Sources / credits candidates (verify on actual import)

1. 3D Assets, *Saturday morning back garden* — https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene — CC0 1.0 Universal, static GLB, provider-specified 0 animations.
2. 3D Assets, *Lawn Mowing Simulator Kit* — https://3dassets.dev/packs/lawn-mowing-simulator-kit — CC0 1.0 Universal, existing committed GLBs.
3. 3D Assets, *Turning Seasons: Four Season Garden* — https://3dassets.dev/packs/turning-seasons — CC0 1.0 Universal, optional leaf pile.
4. Paul Robello, *Grass Blade* — https://github.com/paulrobello/grass-blade — MIT license, code technique reference; copy/derive only with copyright and permission notice retained.
5. Konva project, *Konva + react-konva* — https://github.com/konvajs/konva and https://github.com/konvajs/react-konva — MIT, 2D stroke/compositing if needed.
6. Kenney, *Nature Kit* — https://kenney.nl/assets/nature-kit — CC0, fallback for consistent small foliage.

**Selection status:** sources/public claims checked; complete starter-scene GLB node structure and cross-scene rendering have not been independently imported in this brief. This is the first action of Gate 0, not a task to silently assume passed.
