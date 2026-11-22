# YardShift v0.2 — One-Shot Visual/Asset Integration Task for Cursor Desktop

Repository: https://github.com/Chen-wsnd/yardshift-3d
Start from up-to-date `main` after `30a0eaa`. Work locally and use branch `feature/asset-visual-pass`. Read `docs/EXECUTION_LOG.md`, `src/data/layouts.ts`, `src/game/types/index.ts`, `src/features/yard/{YardScene,YardObjects,Ground,Fence}.tsx`, `src/game/store/gameStore.ts`, and the accompanying `ASSET_MATCHING.md` in full.

## Mission
Upgrade the currently playable YardShift v0.1 to a coherent, attractive **clean base yard + independent problem layers**, without disrupting its two-job, eight-tool, payout, persistence and reset behavior. Produce one complete quality pass; don't stop after one model or repeatedly request approval for minor implementation choices. Keep a detailed accurate `docs/EXECUTION_LOG_VISUAL.md` as you work.

## Hard invariants
- Never change objective IDs, tool IDs, payout amounts, difficulty unlocks, rules, 8/8 and 7/7 target counts, or `yardshift-v01` persisted state semantics merely to fit visuals.
- Keep `src/data/layouts.ts` coordinates and 20×16 base yard. Preserve state mapping by `YardObject.id`.
- Do not bake dirty objects into clean yard geometry. Permanent features are decorative; dirty layers are independently interactive.
- Do not purchase gated packs, bypass permissions, fetch pirated assets, or assume a license. If access blocked, record it and continue with placeholders/free verified material.
- Do not commit or republish third-party source assets to public GitHub without assessing their explicit license; where needed, commit only an asset manifest/loader and instructions, keeping local purchased assets out of Git. Verify license suitability for web distribution too.

## Build all of these in this single pass

### 1. Visual art direction: cohesive semi-realistic backyard
- Establish a soft outdoor daytime lighting rig with consistent shadows/color palette and appropriate camera/contrast. Avoid adding expensive post-processing without evidence it helps.
- Make the ground much more believable than the current single-color planes, optionally with a freely licensed, documented PBR grass texture at 1K or 2K. Keep a simple procedural fallback.
- Upgrade fence, path, and a few permanent trees/shrubs/planters. Keep central lawn open enough for objectives. Avoid filling the playable area with props.
- Do not depend on one monolithic external 3D courtyard. Keep base yard a separate object group.

### 2. Target visual replacement across all existing TargetKinds
- `long_lawn`: clump/instanced grass patches, visibly shorter/cleaner after use.
- `lawn_edge`: visibly ragged → crisp border.
- `tall_edge_grass` / `weeds`: weed/tall grass cluster → short patch/clear state.
- `leaves`: convincing leaf pile/scatter → fade or disperse.
- `hedge`: untrimmed silhouette → tidier shape.
- `fallen_branch`: branched wood shape → disappears.
- `decorative`: permanent and not interactive.
- Implement low-cost transitions (short fade, scale, or swap); don't build realistic 3D cutting physics.
- Imported assets should be swapped through a registry by role, not mixed directly into rules or type-specific interactions.

### 3. Make actual mouse interactions reliable
- Render pointer targets using stable invisible/transparent proxy geometry aligned to each objective. Clicking tiny twig / leaf geometry should not be required to interact.
- Avoid marking clicks from drag-to-orbit as tool uses; preserve camera orbit and zoom behavior.
- Maintain hover highlight and selection feedback even for objects with complex model geometry; clear cursor on hover-out/unmount.
- Progress must only advance after a real, valid tool action; prevent double triggers.

### 4. Asset registry and fallback
- Add small `src/features/yard/assets` module mapping visual roles to paths + source/license notes. Keep UI/game store entirely independent of individual GLB names.
- Prefer GLB models (GLTFLoader/useGLTF) when legally obtained and available; normalize scale, placement and up axis, inspect geometry and texture rendering. Avoid premature downloads of large packs.
- For missing assets, use the improved procedural representation. Make the baseline demo work with **zero purchased assets**.
- Maintain `docs/ASSET_MANIFEST.md` with source URL, verified license/permission status, GLB or texture path, optimization changes, integration outcome, and attribution if required.

### 5. Browser QA and delivery
- Test real pointer interaction on BOTH jobs, not only via `window.__yardshift` store injection. Test tool mismatch, drag orbit, right/left click behavior, duplicate reward, reload, reset. Keep console errors clean.
- Verify typecheck, lint, all tests, production build.
- Capture before and after screenshot paths or attach to execution report if supported; do not invent screenshot evidence.
- Push to `feature/asset-visual-pass` (no force push). Don't merge main until baseline and manual QA are verified.
- Vercel CLI is currently unauthenticated. Do not attempt unsafe login workarounds. Report the exact local `npx vercel login` / `npx vercel --prod` steps for the human to perform after integration.

## Completion criteria
- Both job environments look visibly unmaintained before play and markedly improved after play.
- 8/8 and 7/7 object interactions can be completed with actual mouse pointer testing, not just store scripting.
- Existing 24 tests still pass; no regressions; build succeeds.
- Local-first, no paid purchases; assets accounted for; reproducible setup from README.

## Report format
Summary; changed files; asset sources & license decisions; measured file sizes/performance where available; verification evidence; UI screenshots (if captured); commit SHA; blockers / next polish suggestions.
