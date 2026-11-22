# YardShift V06 — Owner Playtest Pack

**Branch:** `feature/v06-playable-learning-qa`  
**Ancestor:** `feature/v06-professional-learning-loop` @ `d8eb23c`  
**This pack SHA:** `5f7e7d889719e87c70331fa6be07c27acff3e0c8`

Evidence classes: `CODE_CONFIRMED` · `AUTOMATED_PASS` · `BROWSER_PASS` · `HUMAN_NOT_TESTED`

This is a **local** playtest. There is **no** public deploy URL.

---

## 1. Local start

```bash
git fetch origin
git checkout feature/v06-playable-learning-qa
cd "/path/to/Garden Stimulation"   # your clone
# Node 22 recommended
npm ci          # only if node_modules missing / lock changed
npm run build && npm run start
# or for iteration: npm run dev
```

Open **http://localhost:3000** (only if the server prints that port).

Optional checks:

```bash
npm run typecheck && npm run lint && npm run test
```

---

## 2. Save isolation (do not wipe real progress)

| Goal | How |
|---|---|
| Keep your normal save | Use a **separate browser profile** / private window for playtest |
| Persist key | `localStorage` key `yardshift-v03` — **do not** clear whole site storage |
| Reset only this try | In-app **Reset garden** (confirms) or **Try again (same yard)** after Finish |
| What Reset does | Fresh Saturday garden fixture; visit history may be cleared on hard Reset |
| What Try again does | Same initial fixture; **keeps** sealed visit summaries (up to 3) for A/B |

Default product path: **Saturday morning garden** on `/`. Legacy `/legacy` is historical only.

---

## 3. 5–8 minute main script (do not read “answers” first)

| Time | Do this | You should see | If broken, note |
|---|---|---|---|
| 0:00–0:45 | Open yard; find a labeled area; press **Inspect** once | Extra cues (edge / hazard awareness); second Inspect does not stack prep | No entry / Inspect useless |
| 0:45–1:30 | Enter **Side hedge**; **pick** shears or powered trimmer (Start disabled until pick); trim a bit | Different tool look; hedge shrinks; clippings on ground | No debris / wrong tool forced |
| 1:30–2:15 | **Fallen leaves**; rake then bag near east clippings | Piles gather; bag only nearby gathered | Instant yard-clear |
| 2:15–3:10 | **Front lawn**; drag a short path | Grass dark→lighter along path; overview keeps cut | Jump-cuts / unclear grass |
| 3:10–4:00 | **Path edge**; note Lawn % vs Edge % | Edge changes without pretending to be lawn | % conflated |
| 4:00–5:00 | **Flower border**; string-trimmer one weed, then hand weeder; avoid flowers | Tops shorten / roots remain → then root gone; flowers look different from weeds | Line trim “finishes” weed |
| 5:00–5:45 | **Finish visit** → Work review | Honest band (often incomplete / needs-attention); advice cites real event ids; **sealed** banner | Fake “professional complete” |
| 5:45–8:00 | **Try again (same yard)**; change one choice; Finish again | Fresh yard + prior summary; A/B only if quality comparable | History lost / can still edit sealed yard |

After Finish, further cut/rake/pull should be **blocked** with a sealed message until Try again.

---

## 4. Optional A/B rework route (short)

Use the same yard conditions (Try again between rounds). Keep quality similar.

| Round | Actions |
|---|---|
| **A** | Trim east hedge → rake/bag those clippings once |
| **B** | Clear east leaves first → trim same hedge face → clear new clippings again |

Expect: both can end clean; **B** should show **spent rework > 0** when the second cleanup happens; SW-only clean then east cut must **not** invent rework.

Automation covers this in `playableQa.test.ts` / `judgmentLearning.test.ts` (`AUTOMATED_PASS`). Owner confirmation = `HUMAN_NOT_TESTED` until you run it.

---

## 5. Four non-leading understanding questions

Ask **after** play. Score 0 / 1 / 2 (max 8). Do **not** coach first.

1. If lawn sits beside flowers, why that mower — and when would you switch?
2. After string-trimming a weed, why might it still need work?
3. Did you clean the same spot twice? What caused the second pass?
4. Same yard again — what would you check or order differently, and why?

| Q | Score 0–2 | Notes |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| **Total** | /8 | Observed / Needs iteration / **NOT_TESTED** |

---

## 6. Known limitations (honest)

- Game-modeled effort ≠ real work minutes (`SIMULATED_MODEL`).
- No bird-nest / seasonal ecology lock this wave (`NOT_SIMULATED`).
- “Bag leaves” is this visit’s task — not the only real-world option.
- FPS: report only if measured; else `NOT_MEASURED`.
- Human learning outcome: **HUMAN_NOT_TESTED** until this pack is run by a person.

---

## 7. Bug report template

```
Branch/SHA:
Step (table row):
Expected:
Actual:
Screenshot/notes:
```

Feedback: product owner channel (no private email in-repo).

**Pushed HEAD:** `5f7e7d889719e87c70331fa6be07c27acff3e0c8`
