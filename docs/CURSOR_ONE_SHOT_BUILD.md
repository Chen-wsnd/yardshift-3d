# YARDSHIFT — ONE-SHOT FULL MVP BUILD ORDER

**Execution target:** Cursor Desktop **Local Agent**, working in the local clone of `https://github.com/Chen-wsnd/yardshift-3d`.

**Mission:** Upgrade the already-implemented Phase 0 foundation to **YardShift v0.1**, a complete two-job, browser-playable 3D gardening game with eight tools, tool-specific interactions, task board, basic shop and rewards, and a deployed public demo where supported. **Implement the entire MVP in one autonomous execution pass. Do not stop after an isolated subfeature. Do not ask for approvals between steps unless genuinely blocked by access, credentials, destructive changes, or conflicting uncommitted work.**

## 0. Principles and constraints

1. **Use what already exists.** The repository already has Next.js 15, React 19, TypeScript strict, Tailwind 4, Three.js + R3F/Drei, Zustand, tests and a procedural yard. Inspect current source files and adapt the implementation; do not scaffold another app or blindly overwrite the working Phase 0 code.
2. **Working end-to-end beats implementation perfection.** Design the whole product in advance but code the smallest playable version of each system. All major systems should be present and connected before visual polish.
3. **Single interaction engine; data-configured behavior.** Do not write eight incompatible tool simulations. Tool/object compatibility and rewards belong to testable pure functions; 3D rendering provides the feedback.
4. **Local first.** Files, commands and browser testing run locally. Push source after verification. Never use a Cloud Agent or remote build environment in place of local development. Remote services are only for GitHub and optional public deployment.
5. **Avoid external dependencies for baseline functionality.** No database, authentication, payment API, server component that depends on WebGL, real physics engine, real pesticide usage instructions, AI calls, or paid assets required. No code downloads from untrusted arbitrary sites.
6. **Do not build a shallow mockup.** Buttons that appear usable should work. Two jobs must be possible to finish with mouse/pointer clicks. Never report a feature as verified unless tested.
7. **Keep a concise continuously updated `docs/EXECUTION_LOG.md`.** Log actual file areas changed, verification results, blockers, degraded features, and important design choices. Do not fabricate checks, timings or deployment links.

## 1. Product: full user loop

Landing route `/` is a Task Board. User sees two contracts, tool shop entry and balance. Clicking Job 1 accepts it and enters `/yard`. User sees a walkable-looking (fixed/OrbitControls) real-time 3D yard with a clear side HUD: selected tool, targeted cleanup object feedback, objectives and progress. User selects tool, then clicks/taps a matching target; it visually transforms/disappears and progress updates. On completing all **required** cleanup objects, a completion modal appears; user claims the reward once, then returns to Task Board. Job 2 unlocks; user can purchase tool upgrades and repeat the process using another object configuration of the same base yard. A Reset Demo action reliably resets both jobs, inventory, yard objects and rewards.

**Two bite-sized jobs, each designed for roughly 45–60 seconds of player actions (not a guaranteed wall-clock duration):**

- **Job 1 — Overgrown Lawn**: longer lawn patches (mower), tall/edge weeds (string trimmer), messy lawn boundary (lawn edger), optional scattered leaves (rake). Make 6–8 *visible, clickable required* cleanup targets. Reward **500 credits**. This is the first playable job, with required tools already unlocked/owned at start.
- **Job 2 — Backyard Restoration**: leaf piles (rake or leaf blower), hedges (hedge trimmer), marked fallen branch (chainsaw), stubborn weed patch (string trimmer or herbicide). Make 6–8 required clickable targets. Unlock this job when Job 1 reward has been claimed. Reward **350 credits**. Ensure required tools are obtainable for the player with no economic deadlock. Make advanced tools purchasable after Job 1; give a safe **demo loaner** for any missing essential tool when entering Job 2 so the game can always finish, clearly distinguished from permanent ownership.

Use **one shared yard environment** with two job-specific object layouts. Both jobs should be replayable after Reset Demo without page reload bugs.

## 2. Eight real tool categories, one system

Create a typed tool registry with 8 tools, names, icons or emoji, target compatibility, owned/unlocked/price (placeholder game credits), and an abstract visual effect. Preserve/extend existing `GardeningTool` instead of duplicating types.

| toolId | Name | Compatible targets | Visual action | Suggested state |
|---|---|---|---|---|
| rake | Leaf Rake | `leaves` | leaves shrink/slide and vanish | starter owned |
| string-trimmer | String Trimmer | `weeds`, `tall_edge_grass` | grass shortens and fades | starter owned |
| lawn-mower | Lawn Mower | `long_lawn` | green patch becomes neat/short | starter owned |
| lawn-edger | Lawn Edger | `lawn_edge` | jagged stripe becomes clean edge | starter owned |
| leaf-blower | Leaf Blower | `leaves` | leaf cluster disperses/fades | purchasable |
| hedge-trimmer | Hedge Trimmer | `hedge` | bush reduces in volume, becomes shaped | purchasable |
| chainsaw | Chainsaw | `fallen_branch` | marked branch separates/fades | purchasable, game abstraction |
| herbicide | Herbicide | `weeds` | marked weed patch changes color/fades | purchasable, game abstraction |

Suggested one-time purchase prices (game credits, not real product costs): Leaf Blower 45; Hedge Trimmer 70; Chainsaw 100; Herbicide 65. Job 1's 500-credit payout makes all tools affordable; still use the loaner fallback for robustness. Show an optional "recommended" tool for each object type; let compatible alternatives work. Display a short reason when the wrong tool is selected. Avoid real-world operational instructions for chemicals or hazardous equipment.

**Rule contract:** `evaluateToolUse(toolId, targetKind, objectStatus, availability) => {success, feedback, effectType}` must be pure. State actions apply it only on success. Reward and completion actions must be idempotent (cannot claim twice). Cleaned/decorative objects must not receive cleanup interactions.

## 3. Data model and state

Inspect existing `src/game/types/index.ts` and `src/game/store/gameStore.ts`. Reuse the existing `Player`, `Job`, `Yard`, `YardObject`, `GardeningTool`, `Reward`, `GameProgress`, `ToolInteractionResult` where possible. Extend only as needed, e.g. `YardObject.targetKind`, `isObjective`, `interactionState`, `Job.objectiveIds`, and a per-job yard layout. Keep `requiredToolCategory` backwards compatible if necessary. Centralize mutable game state in Zustand; the 3D scene reads from it.

Recommended game actions:
- `acceptJob(jobId)`
- `enterActiveJob()`
- `selectTool(toolId)`
- `interactWithObject(objectId)` with result feedback
- `getJobProgress(jobId)` selector/pure helper
- `completeJob(jobId)` after requirements are satisfied
- `claimReward(jobId)` exactly once
- `purchaseTool(toolId)` balance and unlock validation
- `resetDemo()`

Store multiple yard configurations keyed by job/yard ID, or derive a current yard view from an immutable config plus per-job cleaned IDs. Ensure no stale Job 1 objects in Job 2. Store game progression in browser `localStorage` via Zustand persist with a versioned key and safe client hydration; browser reload should not corrupt state or break Next.js hydration. Avoid persisting runtime Three.js objects.

**Important baseline observations:** Phase 0 sample yard includes leaf pile, weed, debris, bush and tree, but Phase 0 starter tools were Rake and Hand Shears. That does not yield a clean full-game completion loop. Replace or adapt sample data and completion criteria so only explicit targets count; decorative tree/fence/bushes should not block completion. Old initial type names, routes and selectors must remain working or be carefully migrated.

## 4. 3D yard and interaction implementation

Keep the existing `src/features/yard/YardCanvas.tsx`, `YardScene.tsx`, and `YardObjects.tsx` structure. Keep Canvas client-only and OrbitControls. Render one tidy playable yard with lawn, a fence, walkway, plants, simple shadows, ambient light and clear object differentiation. Use R3F pointer events for picking, which already use raycasting internally; no need to write custom raycast machinery unless necessary. Clicks should not accidentally trigger camera drag. On each target, use a hitbox large enough to click easily. Show hover highlight, target name, and a brief success/error message. Disallow repeat clicks after cleaned. Use simple scale/opacity/color transition and small procedural particles only if easy; do not add a physics engine.

Provide visibly different **before/after** states. For mowing/edging, prefer replacing the messy patch with a neat patch to convey progress, not merely removing an object. Show a progress bar `cleaned required targets / total required targets`. Decorative objects never count. Camera should initially frame the entire active job. Desktop browser usability is priority; mobile should have basic responsive controls.

**Assets:** start with procedural shapes to guarantee a working app. Organize `public/assets/models/`, `public/assets/textures/`, and asset registry for future `.glb`/glTF assets. Do not block completion on downloading models, Blender exports or texture optimization. If a *verified* freely licensed, direct-load GLB can be integrated quickly without affecting performance, use it selectively. Preserve a reliable procedural fallback.

## 5. UI and design

Use a visually coherent, credible lightweight product identity called **YardShift**, not generic unstyled buttons. Desktop-first, responsive layout; warm off-white/stone surface, botanical green action color, muted amber highlights, clear typography.

Required screens and states:
- `/` Task Board: hero/title, Job 1 and Job 2 cards with locked/available/in-progress/completed states, tool shop panel or modal, current credits, Reset Demo control.
- `/yard`: immersive 3D yard, camera controls, tool panel showing owned/loaned/locked state, objective list/progress, tool compatibility feedback, back-to-task-board control.
- Job completion modal/panel: reward amount, Claim Reward action, then return/continue CTA.
- Shop: eight tools listed; owning/buying/unlocking actually updates state; disable duplicate purchase and insufficient credits.
- Non-technical player can immediately discover: choose a tool then click something in the yard.

No mandatory tutorial screens, lengthy educational copy, real-world safety warning UX, account systems, music or complex accessibility infrastructure for this hackathon build. Buttons must remain keyboard focusable; show labels and feedback.

## 6. Tests and reliability

Add unit tests covering:
1. compatible and incompatible tool-target combinations, including multi-tool alternatives;
2. decorative targets do not count toward completion;
3. cleaning an object twice does not change score twice;
4. completion fails while any required target remains;
5. reward can only be claimed once;
6. insufficient funds and duplicate purchases are rejected;
7. Job 2 is locked before Job 1 claim and unlocks after;
8. reset returns a fresh playable state.

Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` and fix failures. Browser test actual click-through for both jobs if available (manual or browser automation); explicitly report if browser testing was not available. Test reload persistence and Reset Demo. Avoid reintroducing SSR/WebGL build errors.

## 7. Implementation order INSIDE this single continuous run

This is **not** a request to stop for separate approval at each numbered step. Complete all steps in one work session and self-correct continuously.

1. Inspect git status, remote and existing source. If unrelated local changes exist, preserve them and create a safe branch; never destructively overwrite.
2. Create `feature/full-mvp-v01` from current `main` (or safely resume an existing feature branch).
3. Finalize game data schemas and two job layouts, and the pure tool/target rule engine.
4. Implement Zustand actions, progression, payouts, purchases and persistent/replayable state.
5. Bind existing yard meshes to click interactions, camera, feedback and progress.
6. Implement task board/job state, shop, tool selector, completion dialog and reset.
7. Ensure end-to-end completion of both jobs with all eight tools having meaningful supported interactions. If advanced tools are unowned, make shop and documented demo loaners functional.
8. Add unit tests; run local build/typecheck/lint/test and fix. Browser-verify two jobs if able.
9. Commit the code, push the feature branch. If clean and verified, fast-forward / merge to `main` only if no conflicting upstream changes and push main without force-pushing; otherwise leave feature branch and give precise blocker.
10. If local Vercel CLI integration is already authenticated, deploy public demo using existing project settings and confirm URL works; otherwise do not stall. Log exact required next action for deployment; never invent a deployed URL.

**Time discipline:** Maximize parallelizable low-risk work but never compromise the working core. Prioritize all systems connected first, then tests, then visuals. Reserve the final portion of the session for testing/push/deployment. If nearing time limit, reduce animation detail, asset quality, UI effects, or shop polish **before** removing Job 2, tool engine, cleanup interactions, reward, reset or the public-demo path.

## 8. Reporting and checkpoints

Update `docs/EXECUTION_LOG.md` with a small table whenever a meaningful chunk completes:

| Part | Status | Evidence | Problems / changes |
|---|---|---|---|
| Schema + jobs | ... | paths / test results | ... |
| Game state + economy | ... | ... | ... |
| Yard interactions | ... | ... | ... |
| UI end-to-end | ... | ... | ... |
| QA + Git | ... | ... | ... |
| Deployment | ... | ... | ... |

Do not send routine "what next?" questions. If blocked, continue other independent tasks and report exact actionable blocker. On finish provide:

- working features and what remains placeholder;
- file/module summary;
- command results (pass/fail);
- whether two jobs were actually played through in a browser;
- feature commit SHA, remote branch URL and main status;
- Vercel URL or precise deployment blocker;
- top 5 **visual or usability** issues to refine next.

## 9. Definition of DONE

A first-time visitor can open the project, accept Job 1, use at least four starter tools on different visible target types, clear it, receive a single payout, see Job 2 unlock, access/purchase/try advanced tools including blower, hedge trimmer, chainsaw and herbicide, clear Job 2, receive reward once, and reset/replay. No dead buttons, no impossible objectives, no double payout; typecheck/lint/test/build pass and the implementation is pushed to GitHub.

**Execute now, in one pass.**
