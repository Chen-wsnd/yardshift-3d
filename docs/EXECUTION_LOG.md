# YardShift — Execution Log

## v0.1 gameplay (main)

| Part | Status | Evidence | Problems / changes |
|---|---|---|---|
| Schema + jobs | done | `src/game/types`, `src/data/*` | 8 tools, 2 jobs |
| Game state + economy | done | store + rules | persist `yardshift-v01` |
| Yard interactions | done | click-to-clean | — |
| UI end-to-end | done | board, shop, modal, reset | — |
| QA + Git | done | 24 tests; `30a0eaa` on main | — |
| Deployment | blocked | Vercel logged out | `npx vercel login` then `npx vercel --prod` |

## Visual / asset pass (`feature/asset-visual-pass`)

| Part | Status | Evidence | Notes |
|---|---|---|---|
| Asset registry | done | `src/features/yard/assets/` | Role → path + procedural fallback |
| Ground PBR | done | ambientCG Grass 001 CC0 in `public/assets/textures/grass/` | Auto procedural fallback |
| Lighting / sky / fence / planters | done | `YardScene`, `Fence`, `BaseDecor` | Semi-realistic daytime |
| TargetKind dirty→clean visuals | done | `visuals/TargetVisuals.tsx` | Procedural (no paid GLB) |
| Click proxies + drag guard | done | `interaction/ClickProxy.tsx` | opacity-0 hitboxes (not `visible=false`) |
| Manifest | done | `docs/ASSET_MANIFEST.md` | Licenses recorded |

### Deferred (non-blocking) — do not re-investigate this pass

- Poly Haven Weed Plant 02 GLB: download URL 404; keep procedural weeds.
- Fab / paid vegetation & patio packs: not purchased; out of scope.
- ambientCG AO map stored but not wired (needs uv2).
- Hover ring / highlight polish and short fade animations.
- Occasional click vs orbit friction on small targets (proxies mitigate; precision polish later).
- Mixing photoreal grass texture with procedural props — acceptable for hackathon; unify later if GLBs land.
- PersistGate brief loading flash on cold start.

### Blockers

- **Vercel deploy:** CLI unauthenticated — human must `npx vercel login`.
- No core gameplay blockers known after proxy raycast fix.

## Commands (visual pass)

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm run test` — 24 pass
- `npm run build` — pass

Product-owner playtest owns subjective UX (camera, click feel, visuals). Engineering will refine after feedback.

## Handoff

```bash
npm install
npm run dev
# open http://localhost:3000
```

Branch: `feature/asset-visual-pass` (not merged to main until owner accepts).
