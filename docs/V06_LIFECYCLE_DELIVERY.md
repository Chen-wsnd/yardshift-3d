# V06 Lifecycle Delivery — `feature/v06-tool-judgment-interaction-polish`

**Ancestor:** `feature/v06-final-playable-closure` @ `917d1a0`  
**Contract:** `docs/YARDSHIFT_V06_GLOBAL_INTERACTION_TOOL_LIFECYCLE_REVIEW.md`  
**Test server:** `http://127.0.0.1:3001` (existing `:3000` left alone)  
**Owner learning:** `HUMAN_NOT_TESTED`

## Automation

| Check | Result |
|---|---|
| `npm test` | 144 passed |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run build` | (see commit notes) |

## G01–G20

| ID | Status | Notes |
|---|---|---|
| G01 | CODE_FIXED + BROWSER_PARTIAL | Large hotspot boxes removed; small markers; workMode hides picks; label offset so they do not cover hazard |
| G02 | CODE_FIXED | Flowerbed opaque hit proxies (`opacity` pick spheres), not `visible={false}` |
| G03 | CODE_FIXED | Overlays keep `raycast={() => null}` on presentational meshes |
| G04 | CODE_FIXED + AUTOMATED_PASS | Inspect ≠ clear; hardwood refuses hand clear; stone clears after inspect |
| G05 | CODE_FIXED + AUTOMATED_PASS | `evaluateToolIntent` + hover store; toolbar situational `!` |
| G06 | CODE_FIXED + BROWSER_PASS | UI shows `完好度/condition` + explicit `磨损/wear = 100−condition` |
| G07 | CODE_FIXED + AUTOMATED_PASS | Depleting stroke still applies wear |
| G08 | CODE_FIXED + AUTOMATED_PASS | Repeat topCut zero cost |
| G09 | CODE_FIXED + AUTOMATED_PASS | Rake/bag apply manual wear on real work |
| G10 | CODE_FIXED + AUTOMATED_PASS | Blow miss = no drain |
| G11 | CODE_FIXED | Sealed guards; repair without deferred debt (prior + this branch) |
| G12 | CODE_FIXED + BROWSER_PARTIAL | RMB orbit / MMB pan / wheel zoom / ⟲ reset; LMB reserved for work; full orbit delta not FPS-measured |
| G13 | CODE_FIXED + BROWSER_PASS | Per-tool `!` info cards + situational risk banner |
| G14 | CODE_FIXED | Camera-only copy on markers |
| G15 | PARTIAL | Capture/end-drag present; full shared gesture protocol not rewritten |
| G16 | DEFERRED | Tool pose measurement not expanded this pass |
| G17 | PARTIAL | Manual rake/bag now wear; full toolUse ledger attribution may still be thin |
| G18 | CODE_FIXED + BROWSER_PASS | Intent/event keys in `dictionaries.ts`; zh UI verified |
| G19 | CODE_FIXED + AUTOMATED_PASS + BROWSER_PASS | Default Hands (`selectedToolId: null`) |
| G20 | PARTIAL | New unit tests; browser I-matrix incomplete for dense 3D hits |

## I01–I64 (summary)

**BROWSER_PASS (real UI on :3001):** I01, I13, I14, I25, I38 (stone inspect→clear via Hands HUD), I39 (hardwood refuse), I47, I54 (locale), camera chrome  
**AUTOMATED_PASS:** I34, I40 (guard), I38/I39 store path, blow-miss, rake wear, Hands default, selectTool free  
**BROWSER_PARTIAL / NOT_TESTED:** dense flowerbed I02–I05 mesh hits, situational red `!` hover on lawn (I15), I07 orbit zero-delta proof, I55–I58 layout/FPS (`NOT_MEASURED`), I59–I60 full routes, **I61–I62 HUMAN_NOT_TESTED**

Evidence PNGs: `docs/browser-evidence/v06-lifecycle/`

## L0 re-check

Changes serve observe → judge → choose → use tools correctly: Hands default, preview-free costs, situational risk without hover drain, inspect/clear pedagogy, condition semantics, bilingual reason codes. Residual: reliable 3D pointer automation under high-DPR screenshots; owner must still play independently.
