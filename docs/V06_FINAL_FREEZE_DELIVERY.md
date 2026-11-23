# V06 Final Release Freeze

**Branch:** `feature/v06-tool-judgment-interaction-polish`  
**Baseline:** `c85271b`  
**Freeze SHA:** `3a8bafd`

## Five limited fixes

1. **Acceptable score reachable** — fresh yards only require clearable `lawn-stone-1`. `hedge-hardwood-1` removed from fresh fixtures; legacy hardwood migrates with `requiredForReview: false`. Fixture `saturday-garden-v06.3` for A/B isolation. Old saves kept.
2. **Weed hit proxy** — top-cut visual scale no longer shrinks the click proxy (`FlowerbedTaskStage`). Shell `flowerbed-work-panel` also exposes top-cut / pull for reliable UI completion.
3. **Camera reset** — clearing focus restores `OVERVIEW_CAMERA` position + OrbitControls target (`GardenCanvas` CameraAim).
4. **Tool `!`** — opens info only; does not select the tool. Risk copy matches block-only rules (no fake contact wear).
5. **Repair** — garden visit uses recovery-effort repair at balance 0 (button only when `broken`; no credit-gated dead demo).

## Removals / hides

- Fresh-fixture hardwood hazard (not clearable with current toolbar).
- Unreliable Drei `Html` fullscreen Hands HUD (moved to 2D Shell panel).
- Situational wear claims that implied unrecorded contact damage on blocked paths.

## Browser demo acceptance (real mouse / UI; no store-as-pass)

| Step | Result |
|------|--------|
| Global toolbar appears | **PASS** |
| `!` opens tool intro without selecting tool | **PASS** |
| String trimmer top-cut → hand weeder pull root | **PASS** (Shell weed panel + hit-proxy fix) |
| Hands inspect + move stone | **PASS** |
| Mow LMB progresses lawn / feedback matches tool | **PASS** (cells progressed; reverse-pass feedback shown) |
| Camera ⟲ reset to overview | **PASS** |
| RMB orbit / wheel zoom / MMB pan | **FAIL** — automation cannot right-drag or wheel into OrbitControls (CDP `Input.*` denied; page scroll does not reach canvas). Code maps LMB=work / RMB=rotate / MMB=pan / wheel=zoom; **HUMAN_NOT_TESTED** for those three gestures. |
| Finish visit → real review | **PASS** (Visit summary; no uncleared required-hazard gate after stone clear) |

**Overall demo:** **FAIL** (blocked on unverified RMB/wheel/MMB). Core work/review path otherwise exercised.

Evidence: `docs/browser-evidence/v06-freeze/`.

## 60-second demo route

1. Open yard → toolbar visible (Hands default).  
2. Click `!` on 打草机 → info card (Hands stays selected).  
3. Select 打草机 → panel/click top-cut one weed → 手除草器 → pull that root.  
4. Hands → 石块 inspect → move aside.  
5. Select reel mower → left-drag on lawn; ⟲ reset view.  
6. Finish visit → Visit summary.

## Owner learning

`HUMAN_NOT_TESTED` — especially RMB orbit, wheel zoom, MMB pan, and in-person repair-when-broken click.
