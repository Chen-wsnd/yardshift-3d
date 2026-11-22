# YardShift V06 — Owner Playtest Pack (tool judgment · interaction polish)

**Branch:** `feature/v06-tool-judgment-interaction-polish`  
**Ancestor:** `feature/v06-final-playable-closure` @ `917d1a0`  
**Contract:** `docs/YARDSHIFT_V06_GLOBAL_INTERACTION_TOOL_LIFECYCLE_REVIEW.md`

Evidence tags: `CODE_CONFIRMED` · `AUTOMATED_PASS` · `BROWSER_PASS` · `BROWSER_PARTIAL` · `HUMAN_NOT_TESTED`

Local only — **do not** merge `main`, deploy, wipe `yardshift-v03`, or kill an existing `:3000` service. Prefer a private window and an alternate port (e.g. `3001`).

---

## 1. Local start (preserve :3000)

```bash
cd "/path/to/yardshift-3d"
git switch feature/v06-tool-judgment-interaction-polish
npm ci
npm run typecheck && npm run lint && npm run test && npm run build
npx next dev -p 3001 -H 127.0.0.1
# Open http://127.0.0.1:3001/ in a private window
```

Language: header **English / 中文** (`yardshift-locale`, independent of save).

---

## 2. How to play (tool-first + judgment)

You stay in **one continuous yard**. Bottom **Tools** bar is always available. Default selection is **Hands / Inspect**.

1. Optional: small **camera-only** markers (when Hands is selected) move the view — they do **not** unlock tools.
2. Click `!` on a tool for purpose / limits / checks (preview = **zero** cost).
3. Hover a target: situational `!` (red = risk of abnormal wear if you commit; amber = ineffective). Hover never drains battery or condition.
4. Left-click / drag to **work**. Right-drag to **orbit**. Scroll to **zoom**. Middle-drag to **pan**. **⟲** resets view.
5. **Finish visit** → review → **Try again (same yard)** for A/B.

| Tool | Work on | Watch for |
|---|---|---|
| Hands / Inspect | Stones / hardwood | Inspect ≠ clear; hardwood cannot be hand-lifted |
| Reel / lawn mower | Open lawn | Red `!` near uncleared stone |
| Shears / hedge trimmer | East hedge | Red `!` near hardwood; trimmer jam risk |
| Hand edger / string trimmer | Edge (+ weed tops) | Tops ≠ roots |
| Hand weeder | Weed roots | Risk near ornamentals |
| Rake / blower / bag | Debris | Bag needs a gathered pile; empty blower cone = no drain |

**Condition 100% = intact.** Wear = `100 − condition`. Never read condition as “wear %”.

---

## 3. 8–12 minute script

| Time | Do | Expect |
|---|---|---|
| 0–1m | Load; Tool Bar without zone click | 10 tools + Hands; Hands selected |
| 1–2m | Open `!` on mower; hover near stone | Red situational alert; condition/resource unchanged |
| 2–3m | Hands → inspect stone → move aside | Two distinct steps; lawn freer near that patch |
| 3–4m | Hands → inspect hardwood | Cannot hand-clear; mark/avoid copy |
| 4–5m | Reel mower drag | Forward cut; right-drag orbit works; no save change from orbit alone |
| 5–6m | String trimmer on weed → hand weeder | Stubble then root removed; repeat top-cut = no extra wear |
| 6–7m | Shears / trimmer on hedge | Clippings; stay in same yard |
| 7–8m | Rake → bag | Wear on successful rake/bag; bag on scatter = amber + no fake bag |
| 8–9m | Blower on empty ground | Miss feedback; battery unchanged |
| 9–10m | Finish → sealed | Recharge/Repair/work blocked; camera OK |
| 10–12m | Try again; change one choice | History + A/B when quality matches |

Fail/recover: empty battery → Recharge; jam → Clear jam; broken → Repair (repair does not auto-fill battery).

---

## 4. Four understanding questions (after play — no coaching)

1. Lawn beside a stone — why inspect before mowing?
2. After string-trim, why more weed work?
3. Why can’t Hands clear thick hedge wood the same way as a stone?
4. Same yard again — what change and why?

Score /8: ____ · **HUMAN_NOT_TESTED** until a person plays independently.

---

## 5. Owner checklist (I-matrix highlights)

- [ ] I01 Toolbar without hotspot gate  
- [ ] I07 Orbit/pan/zoom alone → zero world/tool delta  
- [ ] I13 / I14 Tool `!` info  
- [ ] I15–I19 Risk `!` without preview cost  
- [ ] I34 Repeat top-cut zero cost  
- [ ] I38–I39 Stone vs hardwood pedagogy  
- [ ] I47 Condition labeled correctly  
- [ ] I54 Locale switch preserves world hash  
- [ ] I61–I62 Owner play → leave **HUMAN_NOT_TESTED** until done  

Browser evidence folder: `docs/browser-evidence/v06-lifecycle/`
