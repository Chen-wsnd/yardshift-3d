# YardShift V06 — Owner Playtest Pack (closure · tool-first)

**Branch:** `feature/v06-final-playable-closure`  
**Baseline:** `feature/v06-playable-learning-qa` @ `f976eed`  
**Closure master:** `docs/YARDSHIFT_V06_FULL_PROJECT_CLOSURE_MASTER.md` (§13 GATE-G)

Evidence: `CODE_CONFIRMED` · `AUTOMATED_PASS` · `BROWSER_PASS` · `HUMAN_NOT_TESTED`

Local only — no public deploy. Do **not** merge `main` or wipe `yardshift-v03`.

---

## 1. Local start

```bash
cd "/path/to/your/yardshift-3d-clone"   # replace with your real path
git status --short
git fetch origin
git switch feature/v06-final-playable-closure
# Node 22 recommended
npm ci
npm run typecheck && npm run lint && npm run test && npm run build
npm run start
# Open http://localhost:<printed-port>/ in a private window
```

Language: header **English / 中文** toggle (stored in `yardshift-locale`, separate from save).

---

## 2. How to play (tool-first — GATE-G)

You stay in **one continuous yard**. Bottom **Tools** bar is always available.

1. Optional: **Inspect** or click an area label to **look** (camera only — does not unlock tools).
2. Pick **Hands / Inspect** or any tool in the bar.
3. Drag / click matching targets in the 3D yard.
4. Switch tools without leaving the yard.
5. **Finish visit** → review → **Try again (same yard)** keeps history for A/B.

| Tool | Work on |
|---|---|
| Hands / Inspect | Stones / hardwood hazards |
| Reel / lawn mower | Open lawn |
| Shears / hedge trimmer | East hedge |
| Hand edger / string trimmer | Path edge (trimmer also weed tops) |
| Hand weeder | Weed roots (careful near flowers) |
| Rake / blower / bag | Debris anywhere it sits |

Wrong tool on wrong target → no fake progress + short reason.

---

## 3. 8–12 minute script

| Time | Do | Expect |
|---|---|---|
| 0–1m | Load; see Tool Bar without clicking a zone | Tools + Hands visible (TB01) |
| 1–3m | Select mower; drag lawn | Cut path; no canvas flash |
| 3–5m | Switch to shears; trim east hedge | Clippings fall; stay in same yard |
| 5–6m | Switch to rake; clear those clippings; bag | No “back to garden” needed |
| 6–7m | Hands → clear stone | Hazard clears; powered lawn freer |
| 7–8m | String trimmer on edge then one weed | Edge % vs roots stay distinct |
| 8–9m | Hand weeder pull root | Root gone |
| 9–10m | Finish → sealed | Tool bar view-only |
| 10–12m | Try again; change one choice; Finish | History + A/B when quality matches |

Fail/recover: empty battery → Recharge; jam → Clear jam; broken → Repair.

---

## 4. Four understanding questions (after play — no coaching)

1. Lawn beside flowers — why that mower / when switch?
2. After string-trim, why more weed work?
3. Cleaned same spot twice — why?
4. Same yard again — what change and why?

Score /8: ____ · **HUMAN_NOT_TESTED** until a person plays.

中文同义题见 master §12；评分标准相同。

---

## 5. Bug note

```
SHA:
Step / TB id:
Expected:
Actual:
```
