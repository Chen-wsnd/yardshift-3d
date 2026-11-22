# YardShift — 3D Asset Research & Candidates

**Stage 03: asset research only, not a blocker for initial MVP.** These are candidates rather than downloaded/approved models; check exact asset format, creator-specific licensing and size before incorporation. Prefer light `.glb`/glTF over FBX/Blend for browser import. Keep an existing procedural fallback.

## Ranked by integration value

1. **Poly Haven Weed Plant 02** — https://polyhaven.com/a/weed_plant_02 — realistic weeds for cleaning targets, glTF shown, CC0. Potential issue: high detail versus many copies; optimize, instance or limit count.
2. **Poly Haven library** — https://polyhaven.com/models — freely licensed CC0 3D plants, nature assets and HDRIs. Favor selectively integrating one or two small assets.
3. **Kenney Nature Kit** — https://kenney.nl/assets/nature-kit — CC0 plants/trees/fences, lightweight fallback, stylized rather than photorealistic.
4. **Fab Backyard, Patio & Planters — 74 Realistic Game-Ready Props** — https://www.fab.com/listings/0942d4d1-3b6e-400e-8c28-d960c58d144c — includes rake and mower plus props. Confirm price, license, formats and technical load before buying/using. Not automatically approved.
5. **Fab Garden Tools & Greenhouse — 25 Game-Ready 3D Props** — https://www.fab.com/listings/06f4e4eb-d831-4d39-93ef-42b4d64b4772 — lists tools/yard props, FBX + GLB. Check exact package licensing and model suitability; not essential to demo.
6. **ambientCG** — https://ambientcg.com/ — PBR surface materials. Pick one manageable grass/dirt material if time; check specific asset and size.

## Asset-selection rules
- Critical interactive targets (leaf piles, weeds, overgrown patches, hedges, branches) must be independently addressable, not baked into an inseparable single imported scene.
- Every model must have a verified right-to-use license; record attribution if required. CC0 assets are least ambiguous.
- Browser performance matters more than model polygon count. Start with 1K or 2K texture resolution, lightweight models, limited draw calls.
- A static realistic whole-yard backdrop is optional; it must not prevent individual targets from being clickable and removed.
- Do not import models at all if the playable game is not completed and tested.

## Pick after first build
**Option A (fastest):** procedural 3D scene + one grass PBR texture + Poly Haven weed/plant detail. Recommended.

**Option B (higher fidelity):** a small selection of individual Fab garden props + Poly Haven vegetation on procedural ground. More integration and licensing work.

**Option C (photoreal background):** prebuilt garden model + independent interactive targets layered over it. Quality may be best but increases camera, scale and object separation risk.

**Recommended immediate decision:** Choose A for first public build. Revisit B and C only after the game loop is proven.
