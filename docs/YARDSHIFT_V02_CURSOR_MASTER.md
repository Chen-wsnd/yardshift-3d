# YardShift v0.2 — AUTHORITATIVE ONE-SHOT CURSOR BUILD CONTRACT

**Prepared:** 2026-11-22  | **Product owner:** the user  | **Engineering executor:** Cursor local agent

**This is the ONE and ONLY v0.2 instruction.** It replaces both earlier, **unsent** v0.2 documents (`DESIGN_BLUEPRINT_V02.md`, `CURSOR_V02_ONE_PASS.md`, `YARDSHIFT_V02_REVISED_MASTER.md`, `CURSOR_V02_REVISED_ONE_SHOT.md`). Do NOT execute or reconcile those documents separately. Treat this document as the source of truth. Do not invent new gameplay systems, assets, mechanics, pages or pricing without documenting a necessary technical fallback. Do not seek iterative product approvals mid-build: deliver a coherent full working version and let the product owner playtest it.

## 0 — Verified baseline, non-negotiable workflow

- Repo: `https://github.com/Chen-wsnd/yardshift-3d`.
- GitHub checked 2026-11-22: branches `main`, `feature/full-mvp-v01`, and `feature/asset-visual-pass`. **No remote v0.2 branch**. Latest approved visual baseline is `feature/asset-visual-pass`, commit `5aeb387f663a5d41aea5897d30d2cb6915d208c2`.
- Existing stack: Next.js 15 App Router, React 19, strict TS, R3F / Three.js / Drei, Zustand persist, Vitest. Existing features: 2 jobs, 8 tool IDs, board/shop/payout/persistence/reset, ground texture, scene/fence/plantings, raycast click proxies.
- Existing code paths to preserve/extend: `src/game/types/index.ts`, `src/game/store/gameStore.ts`, `src/game/rules/{toolRules,jobRules,economyRules}.ts`, `src/data/{jobs,layouts,tools,player}.ts`, `src/features/yard/{YardScene,YardObjects,Ground,Fence,BaseDecor}.tsx`, `src/features/yard/assets/registry.ts`, `src/features/yard/interaction/{ClickProxy,useTapInteraction}.tsx`, `src/features/yard/visuals/TargetVisuals.tsx` and existing task board / shop UI.
- **Local-first development.** Run `git status --short && git branch --show-current && git remote -v`; do not overwrite uncommitted files. Fetch remote, switch to `feature/asset-visual-pass`, then create `feature/v02-garden-work-sim`. If local modifications exist, preserve them using a safe commit/stash only after inspection; NEVER discard unknown work.
- Keep `main` unchanged. Push the feature branch only after compile/test/build pass. No force push, paid services, account creation, Vercel requirement, new DB or multiplayer.
- Preserve game-engine separation: rendering must not determine authoritative rule outcomes. Add robust, deterministic gameplay with one complete implementation pass, not another series of small manual approval requests.

## 1 — Product definition: the player does actual gardening work

**NOT a tool-to-object matching game.** The user plays as a novice gardener visiting a recognizable family's backyard. The player inspects zones, selects their own tools, drags/clicks across physical work areas, gradually changes the yard, may damage plants or tools, pays for repairs/rentals, and can finish an imperfect, ugly result. Meaningful lessons come from *consequences*, not a pop-up that reveals answers first.

**Required flow (retain simple):** Task board → choose job → residential yard overview → click a work zone → focused 3D work mode → choose tool and act → return to overview to see persistent results → optional workbench/shop/rent → end job (even with low quality) → short grade/pay statement → next job.

- **No instantaneous whole-object clearing.** Each action has limited, visible spatial coverage.
- **No per-action Undo, retry stroke, or magical restoration.** Damage persists for the active contract, and some repair actions only reduce consequences, not undo dead plants/scalped turf. A deliberate new practice run / Reset Demo may start a fresh yard **outside** an active contract, but cannot duplicate payments.
- **No forced warning modals or guaranteed correct-tool hints before mistakes.** Tools have optional inspectable condition/capacity, readable silhouettes and environmental cues. After an action, concise contextual feedback explains what happened and why. Do not invisibly randomize damage: a hidden risk should have physical clues and deterministic rules.
- **Not every wrong tool causes damage.** Some simply make no progress; some perform the wrong kind of progress; plausible misuse has costs. Maintain both experience and reasonable physical credibility.
- **No deep real-world hazardous-device operating instructions.** Chainsaw/herbicide use is a high-level fictional simulation, not advice on machine servicing, safety bypasses, gasoline/oil ratios, chemical mixing or dosing.

## 2 — Two distinctly recognizable residential properties

Create one reusable *scene framework* but **two visibly different house-and-yard layouts**. Do not reuse the identical empty rectangular yard with seven differently positioned markers. Keep proper relative scale and identifiable scene anchors.

### JOB 1 — Maple Lane: Weekly Lawn Care

- Setting: cream/light house rear facade at far edge with back door, windows, porch/patio and a chair; wooden fence; walking path; one tree and garden border. Sunlit modestly messy weekly-maintenance yard.
- Zones: `j1-lawn` (12–16 cuttable cells), `j1-path-edge` (6–8 segments), `j1-tree-leaves` (6 small leaf patches + bag), `j1-fence-grass` (5–6 weed/edge segments).
- Learn: manual versus powered coverage; lawn surface versus edged boundary; gathered leaves are not disposed; work can be crooked or overcut.
- Base contract fee **180 credits**, with a good result at full quality yielding roughly that amount before rentals/expenses (fictional currency).

### JOB 2 — Willow House: Backyard Restoration

- Distinct house facade color, door/window locations, larger paved patio, planted flowerbed next to long hedge, separate tree corner; richer vegetation. Needs substantial restoration, not just another lawn.
- Zones: `j2-patio-debris` (4 litter props + 5 leaf patches + bag), `j2-hedge` (10–12 hedge segments next to flowers), `j2-flowerbed` (6 weed cells + 3 protected flowers), `j2-tree-corner` (2 modest fallen branches + 3 loose cleanup cells).
- Learn: broad mechanical power vs hand precision, blade jam/condition, choosing between removal and superficial trimming, relocating versus collecting waste, visible persistent plant damage. More transformative before/after than Job 1.
- Base contract fee **360 credits** (fictional). Job 2 unlocks on claiming Job 1; no additional hard tool-ownership gate.
- Preserve the existing v0.1 job IDs if possible for routing/tests but change their layouts, titles/copy and balancing to match this contract.

### Overview and focused task

- Overview: default readable three-quarter/isometric perspective. Camera frames the **house and entire back garden**; no more isolated paddock. Hover/select work zone by its physical area, with one short label; clickable focus camera. Do not overlay target ID technical names.
- Focus: close-up of same underlying 3D zone, **not an unrelated flat mini-game**. Use small work-cell meshes / masks (e.g. 2×2 mower patches, hedge segments) with consistent world coordinates. Left press+drag performs work; right drag or distinct Inspect control rotates camera; wheel zoom; single-click fallback. Drag brush stroke is distance-throttled and raycast hit-tested. Pointer capture/drag thresholds avoid accidental clearing during orbit.
- Return to overview always reflects exactly the cells the user worked on. Result before/after uses the same camera viewpoint or a deterministic stored view; optionally show original snapshot side-by-side.

## 3 — REAL asset procurement, with exact priority and constraints

### Design direction: one coherent stylized family

**Primary pack:** `Lawn Mowing Simulator Kit` by 3DAssets.dev — 87 individual CC0-labeled GLB assets in a coherent stylized family, plus an existing reference scene. Publisher lists files as glTF/GLB with +Y up, metre units, and **NO runtime animation** for many pieces. The pack's publisher declares CC0 and some items disclose AI-assisted creation. These are **visual models only**, not working tool physics.

Catalog: `https://3dassets.dev/packs/lawn-mowing-simulator-kit`  
Per-asset manifest endpoint advertised by publisher: `https://3dassets.dev/api/v1/packs/lawn-mowing-simulator-kit` (its availability must be checked locally; do not treat a 404 as a license to invent URLs).

**Specific known model page → published CDN model URL (verify HTTP and file signature locally before adoption):**

| Asset purpose | Source page | Published model URL |
|---|---|---|
| Uncut 2 m lawn tile | https://3dassets.dev/assets/lawn-mowing-simulator-kit-lawn-tile-2m-uncut-e285ae12 | https://cdn.3dassets.dev/assets/27387/v1/model.glb |
| Cut 2 m lawn tile | https://3dassets.dev/assets/lawn-mowing-simulator-kit-lawn-tile-2m-cut-6192b103 | https://cdn.3dassets.dev/assets/27385/v1/model.glb |
| Powered hedge trimmer | https://3dassets.dev/assets/lawn-mowing-simulator-kit-hedge-trimmer-52616d25 | https://cdn.3dassets.dev/assets/27377/v1/model.glb |
| Push powered mower with bag | https://3dassets.dev/assets/lawn-mowing-simulator-kit-self-propelled-mower-with-gr-19515d26 | https://cdn.3dassets.dev/assets/27334/v1/model.glb |
| Dandelion clump | https://3dassets.dev/assets/lawn-mowing-simulator-kit-dandelion-clump-8d61d1ae | https://cdn.3dassets.dev/assets/27417/v1/model.glb |
| Preassembled *reference only* residential backyard | https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene | https://cdn.3dassets.dev/assets/27418/v1/model.glb |

**Next names to locate by browsing the pack manifest or publisher asset pages:** hand hedge shears, leaf rake, garden rake, leaf blower, string trimmer, lawn edger, uncut/cut/striped grass pieces, boundary hedge (trimmed / untrimmed), fence/patio/shed, flower border. **Do not fabricate direct model URLs or model existence** if unavailable; use models above and existing procedural fallback.

**House fallback:** Kenney *City Kit (Suburban)* (40 models, CC0) `https://kenney.nl/assets/city-kit-suburban`; inspect actual download format; if not GLB, convert with a local converter only if easy, else build a cohesive stylized rear facade using basic mesh primitives (wall, roof edge, door, 2 windows, patio). `https://kenney.nl/assets/building-kit` is a secondary CC0 option. Style-match, lighting-match and normalize scale.

**Optional, not a blocker:** ambientCG Grass001 CC0 already integrated in current repo (`public/assets/textures/grass/`). If noisy photoreal grass clashes with stylized kit, replace with color/roughness that matches the kit; avoid mixing incompatible styles. Poly Haven plants previously returned 404, therefore DO NOT retry in a loop. Paid Fab/Sketchfab models require checking license and owner authorization; no paid assets this round.

**Existing open-source gameplay reference code** (study selectively, *do not transplant entire games*):
- MIT `https://github.com/paulrobello/grass-blade`: persistent work / grass cutting footprint, feedback and stubble; adapt ideas only where it meaningfully shortens implementation.
- MIT `https://github.com/luke-b/mow-bot-os-2`: instanced grass and cut-map technique; choose only if it is simpler than small per-cell geometry; do NOT port robot controls, AI, sensor simulators.

**Asset integration instructions**:
1. Download **one** small published GLB first, validate HTTP, binary magic `glTF`, mesh/scene content, and Three.js loader. Browser links existing in source pages are *candidate URLs*, not proof the file is available on your machine. Avoid recurrent 404 failures.
2. Download verified models to `public/assets/models/yardshift-kit/`; use descriptive stable names; add URLs, size, SHA-256, license/provenance to `docs/ASSET_MANIFEST.md`. Do not hotlink production models if local files are available. Preserve existing asset registry; extend with `src/features/yard/assets/modelCatalog.ts`, mapping visual `role` to local URL, scale, orientation, offset and fallback.
3. `useGLTF` / `<primitive object={scene.clone()}/>` with Suspense and fallbacks; cache loaded glTF, avoid reloading per cell. Prefer `InstancedMesh` for repeated simple grass rather than repeated unique heavy GLBs. Visual models never control authoritative raycasting—click/work hitboxes are separate.
4. Separate the residential scene foundation from dirt/problem layers; **do not import the reference scene wholesale as a non-interactive opaque mesh**. Instead pick matching independent assets. A preassembled reference scene may guide spacing and scale only.
5. Create `AssetHealthReport` in dev only: selected GLB role, loaded/fallback, path, approximate size. Log failed assets; do not claim imported if fallback rendered.
6. Limit external-asset research to the first integration pass; **if a specific model fails twice or procurement stalls, use the defined fallback and move on**. Complete gameplay before elective art polish.
7. Respect licenses. Open-source game status does not override proprietary licenses. Preserve notices if any MIT source code is copied/adapted; write explicit code provenance in `docs/THIRD_PARTY_NOTICES.md`. CC0 attribution optional but record in manifest.

## 4 — Authoritative work-system types and rules

Implement a clean new domain subsystem under `src/game/work/` and `src/game/rules/` rather than replacing every old type with untracked ad hoc fields.

```ts
type CellResult = 'untouched'|'partial'|'finished'|'uneven'|'scalped'|'flower_damaged'|'bark_damaged'|'stubble'|'scattered'|'bagged';
type ToolStatus = 'ready'|'unpowered'|'jammed'|'broken';
type PowerSource = 'manual'|'battery'|'petrol'|'hand_pump'|'consumable';
type ActionKind = 'cut'|'edge'|'shape'|'rake'|'blow'|'bag'|'pull'|'treat'|'clear_jam'|'service'|'repair'|'refill'|'recharge'|'inspect';
interface WorkCell {
  id: string; zoneId: string; localX: number; localZ: number;
  remainingWork: number; // 0..100
  result: CellResult;
  damageKinds: string[]; // unique, persistent, may be visually represented
  collected: boolean;
}
interface WorkZone {
  id: string; jobId: string; kind: 'lawn'|'edge'|'leaves'|'hedge'|'flowerbed'|'branch'|'litter';
  name: string; cameraTarget: [number,number,number];
  bounds: { x:number; z:number; width:number; depth:number };
  cells: WorkCell[];
}
interface ToolInstance {
  id: string; power: PowerSource; status: ToolStatus;
  condition: number; // 0..100
  resourceType: 'none'|'fuel'|'battery'|'fluid';
  resource: number; // 0..100; fictional normalized units
  jamEventIds: string[];
}
interface ToolProfile {
  id: string; compatibleZoneKinds: string[]; actionKind: ActionKind;
  coverageRadius: number; workPerStroke: number;
  precision: number; wearPerStroke: number;
  purchaseCredits: number; rentalCredits: number;
}
interface WorkAction {
  jobId: string; zoneId: string; toolId: string; action: ActionKind;
  worldX: number; worldZ: number; strokeId: string; direction?: [number, number];
}
interface WorkEvent {
  id: string; kind: 'progress'|'ineffective'|'jammed'|'broken'|'not_powered'|'scattered'|'environment_damaged'|'repaired'|'refilled';
  zoneId: string; toolId: string; cellId?: string; qualityDelta?: number; costCredits?: number; explanation: string;
}
```

- The above are stable contract **shapes**, not a command to duplicate definitions already present. Reuse existing `Job/Yard/Player/Tool` IDs and fields, adding new types where required. Keep TS strict.
- Implement `applyWorkAction(snapshot, action): { nextState, events }` **pure deterministic function**; it checks tool ownership/rental, power readiness, tool condition, compatible work area, local brush footprint, remaining work, visible environment hazards, and effect. Called by one Zustand store action `performWorkAction(action)`.
- The *only* authoritative state is Zustand. R3F uses derived cell state and model variants. Interactions cannot directly flip old `YardObject.cleaned` (derive from cells), nor bypass quality or durability.
- Use small readable grids: broad lawn 12–16 cells, long hedge 10–12, foliage 5–8 groups, flowerbed 6 weeds and 3 protected blooms. One brush hit updates nearby cells with deterministic distance falloff. Mouse strokes should be throttled (e.g. one action per crossed cell or ~90 ms with movement), not fire hundreds per frame. A click performs one valid small action.
- Distinguish **work done** from **quality**; a cell may be finished but damaged. Track `finishedWorkPct`, `qualityScore`, `workActions`, and settled `netCredits` separately. Aggregate damage events by **unique key** (`jobId:zoneId:cellId:kind` or `jobId:toolId:jamSignature`). The same damaged plant/bald patch should not deduct money repeatedly on every click.
- `strokeId` stops duplicate pointer events, without disabling successive legitimate strokes on separate cells. Store no raw high-frequency mouse positions in localStorage; only compact cells/tools/ledger.

## 5 — Tool & environment simulation: mandatory design matrix

**These are FIXED DEMO GAME VALUES, not measured real equipment work times or retail dollars.** They should be defined centrally in data/config. Do not arbitrarily adjust to make everything one-click.

| Tool ID | Category / start | Work per action and footprint | Power / condition | Plausible mistake |
|---|---|---|---|---|
| `rake` | starter manual | 1–2 leaf cells moved toward pile, work 25/cell | condition 100; wear 0.5 | useless against hedge; leaf pile can be scattered by wrong directional action |
| `bag` | starter manual | removes 1 gathered pile / litter unit after collection step | condition 100; wear 0.1 | bagging spread leaves first: no action |
| `hand-hedge-shears` | starter manual | 1 hedge segment, 25 work; precise | wear 1; jam if tagged coarse wood; condition drop 15 once | rough thick/entangled branches may jam/strain |
| `hand-weeder` | starter manual | 1 weed cell, 50 work; removes root | wear 1 | selecting protected flower uproots it (persistent flower damage) |
| `manual-reel-mower` | starter manual | 1 lawn cell, 30 work | wear 1; manual | edges rough, plant clipping if player crosses boundary |
| `hand-edger` | starter manual | 1 edge cell, 30 work | wear 1 | misaligned border stays crooked |
| `loppers` | starter manual | 1 small branch, 50 work | wear 1 | too-thick/entangled wood jams; repeated misuse may break |
| `string-trimmer` | powered, buy/rent | 1–2 edge/weed cells, 60 work | choose **battery-powered** profile for v0.2; resource battery | only cuts weed tops; may damage flowers or tree bark at boundaries |
| `lawn-mower` | powered, buy/rent | 3 adjacent lawn cells, 50 work each | choose battery-powered profile; charge required | overcut if repeatedly crossing finished cell with low cut setting; bald turf persists |
| `lawn-edger` | powered, buy/rent | 2 edge cells, 60 work | battery; precise line but broader than hand tool | crooked edge if brush crosses path; condition wear |
| `leaf-blower` | powered, buy/rent | gather 3 leaf cells toward pile, not remove | battery charge; wear 0.7 | wrong blow direction scatters into nearby bed, generating extra cleanup |
| `hedge-trimmer` | powered, buy/rent | 3–4 hedge segments, 50 work each | battery charge; wear 1.5 | wide footprint removes protected bloom / overcuts hedge |
| `chainsaw` | advanced optional, not required | only marked large fallen wood, 1 large section | petrol tool, has fuel+condition; jam on visibly entangled wood | snag/jam or blade wear, not hedge substitute; no real use procedures |
| `herbicide` | advanced optional treatment | treat one suitable weed zone, **delayed review** | hand-pump sprayer with `fluid`, **NO gasoline requirement** | misdirected treatment may damage nearby flowers at review |

Tool categories must preserve all eight legacy IDs. You may add the manual IDs above without renaming existing IDs. Add new modes to tool data, but do not create separate giant tool-specific React components. `ToolProfile` + reducer rules + effects must handle them.

### Realistic equipment state/failure categories (NOT all the same)

1. **Unpowered**: empty battery/fuel means the device cannot start; the attempt costs a little *in-game time*, but DOES NOT damage the engine merely because fuel was empty. Expose `battery=0` / `fuel=0` in optional Inspect Panel, but no mandatory pre-action warning dialog.
2. **Worn / hot / maintenance neglected**: operations reduce condition; heavy use when condition < 20 adds accelerated wear; if player continues operating under strain, the tool can break or require a service action. Avoid detailed real-life mechanical procedures. For a petrol power-tool variant only, an explicit "needs service / low lubrication" condition may increase wear under running load, **not** simply missing fuel. The default v0.2 trimmer/mower remain battery-powered so do NOT show a gas-fill requirement on them.
3. **Jammed**: deterministic interaction with a visible entangled vine/thick branch/foreign object sets `status=jammed`, decreases condition once, halts progress. `Clear jam` is an abstract in-game action (time/credits); NO real instructions for unclogging running equipment. A visibly tangled patch may be handled with slow hand tool first.
4. **Broken**: condition reaches 0 or one severe persistent incident. No further work until `Repair` at a generic workbench (fictional credits/effort) or another tool is chosen; no instantaneous Undo. Manual tools can also jam/break when abused on unsuitable work.
5. **Chemical treatment**: herbicide fluid charges reduce only for optional abstract applications; effect is marked `pending_treatment` and resolved at settlement/next review, not instantaneous removal. Off-target impact may produce flower damage, never gasoline-engine breakage for a hand sprayer.

**No unfair random catastrophic breakdowns.** Condition degradation should be deterministic and discoverable through inspection and physical cues. Same risk event once per object/damage signature; repeated failed presses cannot multiply repair bills. Prevent unlimited service/refill exploits. Provide a generic repair option if all practical tools become unusable, even with insufficient funds: consume in-game effort and register a small capped settlement deduction; never make a contract impossible to finish.

### Tool action states and visible examples

- Lawn: uncut tall blades → partial irregular cut → smooth/striped mown grass; overworking at low cut setting → brown scalped patch stays.
- Hedge: overgrown irregular silhouette → trimmed sections → neat shape; broad careless powered tool sweeps can leave bare crooked notch and clip flowers; hand shears are slower but controlled.
- Leaves: spread leaves → moved to obvious leaf pile → bagged/removed; blower only moves them; wrong direction pushes some into bed and adds work.
- Weeds: unpulled plants → tops cut/stubble (trimmer) versus roots removed (weeder); stubble does not count as fully removed in a flowerbed job. Treatment remains pending.
- Branch: manual lopper / saw removes a suitable small branch, leaving offcuts to collect; advanced chainsaw is **not required** for this first two-job gameplay.
- Tool: optional upper-right mini badge and small equipment display show selected tool **condition and resource**. At 0 resource, action visibly sputters/no start; at jam, animation stops; at break, tool becomes unusable. No full-page tutorials.

## 6 — Economic balance and solvability (fictional credits)

- New v0.2 fresh start balance **40**. Starter manual set includes `rake`, `bag`, `hand-hedge-shears`, `hand-weeder`, `manual-reel-mower`, `hand-edger`, `loppers`. Give player a basic `toolbox` UI; not a separate management sim.
- Job 1 base **180**; Job 2 base **360**. Compared to old 500/350, this is deliberate: higher job pays more, advanced equipment isn't all affordable after one job.
- Advanced purchase / rental values:

| Tool | Purchase | Per-job rental |
|---|---:|---:|
| `string-trimmer` | 420 | 35 |
| `lawn-mower` | 950 | 55 |
| `lawn-edger` | 680 | 45 |
| `leaf-blower` | 550 | 40 |
| `hedge-trimmer` | 850 | 65 |
| `chainsaw` | 1900 | 95, optional only |
| `herbicide` | 300 + consumable cost | not mandatory |

- Manual starter alternatives can finish all mandatory parts of both jobs. **Do not gate Job 1 behind a power tool.** Eliminate the old automatic free advanced `JOB2_LOANER_TOOL_IDS` behavior; rent must be explicit and charged at most once per job. If a client wants a power tool but cannot afford it, show the manual option and its slower expected work.
- `RentalLedger`: charge once on first `Rent for job`; not again on replaying UI or page refresh. Repair at workbench: fictional 8 credits basic manual, 25–60 powered, or deferred capped charge if balance insufficient; condition +70 to 100 depending on class. Resource refill/recharge: 5–15 credits, or generic free slow manual maintenance for necessary starter tools so no softlock.
- **Damage does not automatically fail a job.** Define progress completion independent from garden condition. Player can finish if >= 70% essential work resolved, but if work remains unfinished, must actively press `Finish Job Early` and accept reduced outcome. At 100% work, `Finish & Review` is available regardless of low quality. No action-level Undo; new practice run only outside active job and cannot farm rewards.
- `completion=0..1; quality=0..100`. Net credits formula (predefined demo value):
  `gross = round(basePayout * (0.4+0.6*completion) * (0.55+0.45*quality/100))`; `net = max(0, gross - rentalFees - repairFees - oneTimeDamageFees)`. Settlement credits awarded at most once by job ID. Repair fees are charged either at time of service OR settlement, not both. Use ledger item IDs for idempotence. Allow a bad, ugly, incomplete job to finish with low or zero payout. Never silently wipe equipment damage between zones.
- In-game purchase costs are **not realistic retail prices**. UI label currency `credits` and use simple fictional shop values. No real-world price claims.

## 7 — How to implement it in THIS repository (do not improvise architecture)

Required new files or equivalent minimal additions:

```
src/game/work/{types,engine,selectors,fixtures}.ts
src/game/rules/{durabilityRules,qualityRules}.ts
src/data/{workZones,equipmentProfiles,sceneLayouts}.ts
src/features/yard/{ResidentialYard,ZoneHotspots,FocusedWorkView}.tsx
src/features/yard/visuals/{WorkCellVisuals,DamageVariants}.tsx
src/features/yard/assets/modelCatalog.ts
src/features/tools/{EquipmentPanel,ToolInspection}.tsx
src/features/economy/{RentalControls,WorkbenchPanel}.tsx
src/features/jobs/{SimpleJobResult}.tsx
src/game/work/*.test.ts
```

Do not create everything as blank scaffolding: each required work mode must have a working renderer and reducer behavior. Keep old `src/features/yard/YardScene.tsx` as scene root and old `YardObjects` as compatibility wrapper if needed. Existing `src/game/store/gameStore.ts` orchestrates new work state. No additional backend.

**Concrete implementation sequence within ONE agent run:**

1. Safely branch; audit existing files and tests. Save short repo status.
2. Check 3DAssets pack pages and download 3–6 actually reachable CC0 models; normalize scale/rotation, visual-check one GLB. If remote fails use procedural fallback and record; **do not stall entire run**.
3. Build both residential base layouts and zone hotspot positions; ensure each has house facade and recognizable yard zones.
4. Implement pure work reducer, equipment state, deterministic fault/error events, once-only damage ledger, compact persist v0.2.
5. Wire selection/drag work and focused camera; implement four key modalities and visuals, condition badges.
6. Wire repair/refill/rent/shop with fixed numbers, Job1/Job2 progression, early finish and payout. Keep UI sparse.
7. Add concrete tests and perform minimal runtime smoke. Run full typecheck/lint/Vitest/production build **once at the end** (and as needed for genuine blockers), not after every tiny edit.
8. Update `docs/ASSET_MANIFEST.md`, `docs/EXECUTION_LOG.md`, `docs/THIRD_PARTY_NOTICES.md` if any copied MIT code; commit/push feature branch only; prepare handoff for human playtest.

### Persistence and migration

- New localStorage key **`yardshift-v02`**. Do not overwrite or delete existing `yardshift-v01`. Do not silently translate old 8-click completion into new work-cell completion, nor inherit misleading old fully-owned powered tools. Start a fresh `v0.2` game with clearly labelled `Start v0.2 Demo` or an equivalent one-time explicit reset option. Persist schema version and implement `migrate` / validation for future v0.2 updates.
- Save cell state, tool condition/resources, damage ledger, rental ledger, claimed jobs and balance; do NOT save hover, transient popovers, high-frequency pointer streams. Reload/zone switch must preserve injury, broken tool, unpaid fees, quality and progress. Keep old `Reset Demo` working with confirmation.

### Rendering/playability constraints

- Maintain stable local browser startup (`npm run dev`), client-only WebGL and procedural fallback if any model missing.
- For asset import, inspect actual scaled bounding boxes and avoid wrong axis; reuse `useGLTF` cache / clone or instancing as appropriate. Complete animation via mesh variants / simple tweens; do not attempt expensive skeletal character animation.
- A normal user can identify house, patio, plant beds, grass, leaves, hedge and tool without reading internal IDs. Work zones need distinct outlines on hover, not neon hitbox overlays all over lawn.
- Permit keyboard click fallback; support touch taps where reasonable. Do not block local desktop playtesting for a perfect phone version.
- Use concise post-action explanation only after consequences. No endless warning dialogues or interstitial tips. Optional inspect equipment stats is allowed.

## 8 — Exact acceptance tests (engineering + owner)

Automated pure-function tests MUST include at least:

1. A hand-shear stroke affects one hedge cell; powered hedge tool covers ~3 cells and reduces equivalent work faster.
2. A partly worked cell stays partial after leaving and re-entering focus mode and page reload.
3. Work at one lawn cell never completes an adjacent untouched cell unless the active tool's documented brush radius covers it.
4. Rake/blower moves scattered leaves into a persistent pile, requiring separate bag/collection step.
5. String trimmer in flowerbed cuts weed tops to `stubble` without satisfying root removal; hand weeder completes it.
6. No fuel in a petrol device / no charge in a battery device = `unpowered`, **no engine damage just for no fuel**.
7. Using shears/loppers on tagged too-thick/entangled wood creates a one-time jam/wear; a separate normal action doesn't magically clear it.
8. Repeating action on same already damaged flower does not create additional damage or fees.
9. If powered hedge tool cuts across protected flower cell, flower remains visibly injured after changing zones or reloading; cannot undo in current contract.
10. An exhausted/broken tool cannot work; repair action restores function with correctly booked once-only cost.
11. Renting a tool twice in the same contract does not double charge; zero-credits player retains a manual path to complete both jobs.
12. 70%+ early finish permitted with low payment; under threshold refused, and normal 100% completed job accepts visibly ugly quality.
13. Job rewards can be claimed only once; restart practice cannot double-pay claimed contract.
14. Job 2 displays distinct home and zone layout; no completion deadlock, with zero power rentals.
15. Existing job/board/shop contracts do not regress; `typecheck`, `lint`, all tests, `build` pass.

**Minimal visual smoke:** both `/` and `/yard` load; navigate to each residential job, enter one focus zone, click/drag one manual action, cause one damage incident deliberately, inspect one tool condition, return to overview. DO NOT spend hours repeatedly tweaking subjective hover and camera feel: that is for owner playtest.

### Product-owner handoff contract

Stop further coding when the coherent v0.2 build is delivered. Report:
- Branch and exact Git commit SHA, files changed; never claim remote push without confirmation.
- Model URLs successfully downloaded and actually used, model count, fallback list; checksums/provenance in manifest.
- Implemented zone types and manual-vs-powered differences.
- Which failures and irreversible outcomes are reproducible and how to reach them **in game** (not real-world equipment instructions).
- Tests and specific unverified areas; exact local run instructions `npm install && npm run dev`.
- Quick owner test flow: reset v0.2 → Job 1 lawn manual vs rental → work result → Job 2 hedge shears vs powered + deliberate damaged bloom → repair / bad finish → review earnings.
- Remaining non-blocking backlog. **DO NOT merge into `main` or deploy.** Owner decides after playtest.

## 9 — Hard scope limits and self-check before final report

**Prioritize coherent gardening feel over quantity.** If time is constrained, keep the four meaningful focused activities working (mow/edge; hedge; leaf gather+bag; weed pull) and 2 properties, a functioning damage/repair mechanic, and a real completed bad job; keep optional chainsaw/herbicide as declared advanced mechanics with honest disabled/abstract state. Do not claim implementation of a missing tool action.

Do not:
- Make all tools one-click variants or automatically erase progress after poor results.
- Treat every wrong tool as damage, nor break an unfueled engine simply because it has no gasoline.
- Treat herbicide as gasoline or as instant weed eraser.
- Automatically grant all advanced tools as free loaners.
- Re-create a whole game engine, add irrelevant services, generate an excessive new planning hierarchy or write fabricated licensing/source evidence.
- Use a public production CDN as the only runtime asset source when local verified assets can be committed.
- Keep improving beyond this one-pass implementation after it is stable; deliver it for real human playtesting.

**Success definition:** A player can work on two visually different real-feeling yards, see slow/manual vs fast/powered work, accidentally damage something, lose or repair a tool under believable circumstances, choose to leave a poor garden, and see the costs/outcomes persist in the final review. The owner, not Cursor, decides whether the feel is fun.
