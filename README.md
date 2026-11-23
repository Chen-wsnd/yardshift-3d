# YardShift 3D

Browser-based 3D gardening simulation. One continuous Saturday home garden where observation, tool choice, cross-task debris, and a sealed work review teach how experienced gardeners organise a job.

**Hackathon release:** V06 final freeze on `main` (source branch `feature/v06-tool-judgment-interaction-polish`). Freeze fix SHA `3a8bafd`; delivery tip includes this README. Owner / freeze notes: `docs/V06_OWNER_PLAYTEST.md`, `docs/V06_FINAL_FREEZE_DELIVERY.md`.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Three.js / React Three Fiber / Drei · Zustand (persisted) · ESLint · Vitest

## Local start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port you choose, e.g. `npm run dev -- -p 3001` → [http://127.0.0.1:3001](http://127.0.0.1:3001)).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `node scripts/inspectGardenScene.mjs` | Measure starter GLB world bounds |

Optional QA overlay: `/?debugPlacement=1`

Persist keys (do not wipe for normal play): `yardshift-v03` (garden), `yardshift-locale` (language).

## 60-second demo

1. Open the yard — bottom **Tools** bar visible; **Hands / Inspect** is the default.
2. Click **`!`** next to String Trimmer (打草机) — tool intro only; Hands stays selected.
3. Select String Trimmer → top-cut one weed → select Hand Weeder → pull that root.
4. Hands → inspect the lawn stone → move it aside.
5. Select the reel mower → left-drag on the lawn; click **⟲** to restore the overview camera.
6. **Finish visit** → real Visit summary / work review.

## Known Limitations

- **Camera gestures:** RMB orbit, mouse-wheel zoom, and middle-button pan are wired in OrbitControls (`LMB` = work, `RMB` = rotate, `MMB` = pan, wheel = zoom). Automated freeze QA could not fully verify those three gestures with real mouse drags; treat them as **HUMAN_NOT_TESTED**. Overview reset via **⟲** was verified.
- **Weed picking:** 3D hit proxies stay full-size after top-cut, but canvas picking can still be brittle; a Shell **flowerbed work panel** is the reliable UI fallback for top-cut → pull.
- Hardwood in the hedge is **not** a required clearable hazard on fresh yards (no fake hand-clear). Legacy saves keep the object marked non-required for review.
- Garden repair at balance `0` uses **recovery effort** (no credit charge); the Repair control only appears when a tool is `broken`.
- Debris / some tools still use readable proxy meshes in places (kit GLBs are in-repo).
- Path edge uses **independent** edge segments (not lawn cells).
- Touch / mobile pointer: limited; desktop mouse is the intended path.
- Owner learning outcome remains `HUMAN_NOT_TESTED` until a person runs the Owner pack. **150 automated tests ≠ full human acceptance.**

## Specs & evidence

- Specs: `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md`
- Atlas: `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md`
- Freeze delivery: `docs/V06_FINAL_FREEZE_DELIVERY.md`
- Browser evidence: `docs/browser-evidence/v06-freeze/`

## Assets & Credits

[docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md) · [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) · placement: [docs/v06-scene-placement-map.md](docs/v06-scene-placement-map.md)

| Resource | Creator | License | Local path |
|---|---|---|---|
| Saturday morning back garden | 3D Assets | CC0 1.0 | `saturday-morning-back-garden.glb` |
| Rusty push reel / powered mower | 3D Assets | CC0 1.0 | `manual-reel-mower.glb` / `mower.glb` |
| Hedge, dandelion, tools kit | 3D Assets | CC0 1.0 | `yardshift-kit/*.glb` |
| Grass 001 textures | ambientCG | CC0 1.0 | `public/assets/textures/grass/` |
| Grass Blade | Paul Robello | MIT | *REFER_ONLY — not vendored* |

## License

See [LICENSE](LICENSE).
