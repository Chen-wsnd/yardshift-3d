# YardShift v0.1 → v0.2 — Verified Asset Matching

Date: 2026-11-22. Source repository: https://github.com/Chen-wsnd/yardshift-3d

## Architectural decision
Keep a clean *base yard* and add/remove independently addressable problem objects. Do not bake objectives into a single monolithic scene. Preserve the existing `YardObject.id`, `targetKind`, `position`, `scale`, `cleaned`, `interactionState`, `isObjective` contract and store actions. Model assets are presentational only.

The current yard is 20 × 16 scene units (`src/data/layouts.ts`); the ground currently uses planes 20×16 and 22×18; fence around x ±10, z ±8. Reuse this coordinate system. Do not rescale or re-layout objectives merely to fit models.

## Recommended supply stack — prioritize by function

| Priority | Source | Contents | Best project role | Verified detail | Status / constraint |
|---|---|---|---|---|---|
| 1 | ambientCG Grass 001 — https://ambientcg.com/view?id=Grass+001 | PBR grass material | Replaces `Ground.tsx` flat green | CC0; grass material | Free source, not yet downloaded; pick 1K/2K textures |
| 1 | Fab Free Street Litter Sampler — https://www.fab.com/listings/ac54468d-10f8-4498-b062-991daf114dfd | 14 separate cans, bottles, paper, etc. | Future non-required trash scatter; optional future new target type | Free; GLB FBX OBJ; author permits game use but forbids re-sale of source files | Download requires site action; verify package license before putting raw assets in public GitHub |
| 1 | Poly Haven Weed Plant 02 — https://polyhaven.com/a/weed_plant_02 | Photoreal ground weeds | `weeds`, `tall_edge_grass` targets | CC0, glTF option, approx. 17k tris; downloadable lower resolution | Free; not downloaded |
| 1 | Poly Haven Shrub 02 — https://polyhaven.com/a/shrub_02 | Low-growing shrub | `hedge` placeholder only or base decor | CC0 glTF | Free; may not visually read as pruned hedge |
| 2 | Fab Urban Trees, Shrubs & Plants Vol. 2 — https://www.fab.com/listings/0c87419c-c767-4b32-8bd2-0d21d3714568 | 65 shrub, grass, hedge, weed strip, fallen tree models | Most functionally complete vegetation replacement | Description: GLB with PBR, avg 852 triangles/model, base pivot, m scale. **UI format panel only shows FBX: must verify before buying** | Likely paid; unknown price; acquisition not authorized |
| 2 | Fab Backyard, Patio & Planters — https://www.fab.com/listings/0942d4d1-3b6e-400e-8c28-d960c58d144c | 74 separate GLB props, pergola, garden gate, planters, rake, mower | Permanent base yard decoration / realistic equipment | GLB, 3 LODs specified for FBX, GLB LOD0; NO vegetation; no rig/animation; LOD0 3k–35k tris each | Likely paid; unknown price; not a prebuilt backyard |
| 2 | Fab Home & Yard: Lawn — https://www.fab.com/listings/cc949e03-2daf-4741-8100-9c20b2a9deb3 | 37 low-poly models incl. mower, trimmer, blower, edging, clean/overgrown lawn tiles | All-in-one consistent *stylized* fallback; excellent function fit | Explicit GLB + FBX; 10 animations; AI-assisted | Likely paid; unknown price; mix cautiously with realistic assets |
| 2 | Poly Haven Grass Medium 01 — https://polyhaven.com/a/grass_medium_01 | Natural grass geometry | Instanced `long_lawn` patches | CC0 glTF available; source displays 2M triangles at high detail (too heavy untouched) | **Only use aggressive low-LOD/decimated version** |
| 3 | Kenney Nature Kit — https://kenney.nl/assets/nature-kit | 330 low-poly nature assets | Low-cost consistent fallback scenery | CC0 | Free, but style mismatch with realistic PBR assets |
| 3 | Fab Autumn Leaf Pile — https://www.fab.com/listings/c1cc00b8-3585-4cc2-9d3f-2eedc10a2134 | Leaf heap model | `leaves` target replacement | Product page exists; source format needs acquisition check | Price/license not confirmed; not yet downloaded |

## Existing data mapping (verified in `src/data/layouts.ts`)

| `TargetKind` | Current visual in `YardObjects.tsx` | Desired visual asset / method | Cleaning transition | Jobs |
|---|---|---|---|---|
| `long_lawn` | brownish/dark green box | GPU-instanced grass tufts on a distinct patch; optionally paired clean tile | lower grass height or show clean patch | J1 (2) |
| `lawn_edge` | rectangular strip | narrow ragged grass strip / edge cover | replace ragged strip with neat clipped strip | J1 (2) |
| `tall_edge_grass` | cone group | mixed tall grass tuft | shrink/fade to tidy grass | J1 (1) |
| `weeds` | cone group | Weed Plant 02 or strip from Fab vegetation pack | fade / leave short patch | J1 (1), J2 (2) |
| `leaves` | gold sphere | heap or textured small scatter collection | opacity/scale animation to gone | J1 (2), J2 (2) |
| `hedge` | block | hedge / shrub model, distinct rough & tidy variants | scale/replace silhouette | J2 (2) |
| `fallen_branch` | single cylinder | forked branch / fallen tree fragment | shrink/fade or disappear | J2 (1) |
| `decorative` | tree, bush, path | permanent fence, stone path, tree, planters | never clean / never count as objective | Both |

**Important:** The current game has no `trash` target kind or trash equipment compatibility. Add scattered trash only as *non-objective decor* during this visual pass. A future playable trash target needs an explicit domain type/rules/job change and an appropriate pickup tool; do not silently attach a new objective.

## Recommendation & limits

- **Best realism-per-time:** existing procedural clean yard + ambientCG PBR ground + Poly Haven low-res weeds + free small litter props + quality lighting. No premium purchase required.
- **Best visual expansion if allowed to purchase:** Fab Urban Trees 65 for grass/hedges + Backyard Patio 74 for scene props. This is not one full garden scene; the existing yard layout composes them. Keep the current rules.
- **Best quick all-in-one functional kit if willing to accept stylized graphics:** Fab Home & Yard Lawn 37.
- **Do not mix photoreal, heavily stylized, and low-poly assets without a cohesive art direction.** Choose one reference style, lighting treatment and texture scale.
- **Do not commit paid GLB source files to a public repo unless the asset license explicitly permits redistribution.** Prefer user-approved/private storage and documented asset manifest; a live website also serves model files publicly, so check applicable licensing/anti-extraction restrictions before use.
- Track item source URL, license, format, purchase state, asset location, triangles, textures, and whether replaced in `docs/ASSET_MANIFEST.md`.

## Intended delivery sequence
1. Retain full working v0.1 and capture a baseline screenshot / browser run.
2. Add `YardAsset` registry and asset-loader/fallback switch; preserve existing objective ids and store logic.
3. Replace ground texture and permanent decoration, then weeds/grass/leaf piles/hedges; one type at a time in the same autonomous implementation session.
4. Keep simple transparent **invisible click-proxy meshes** for each objective instead of relying on detailed imported mesh raycasts. Distinguish tap versus drag to preserve OrbitControls.
5. Keep procedural fallback for missing/failed assets. Never let missing materials or model format block the build.
6. Measure load time, test both jobs manually with actual pointer clicks, check `npm run typecheck && npm run lint && npm run test && npm run build`, confirm credits once only and reset/persist.
7. Deploy public Vercel demo after local approval. Current deployment blocked by CLI logout; user must authenticate locally.
