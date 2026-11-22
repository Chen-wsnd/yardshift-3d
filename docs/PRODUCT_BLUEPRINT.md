# YardShift 3D — Product Blueprint v0.2

## Product hypothesis
A first-time visitor should understand the job board, clean two short 3D gardens with different tool choices, earn in-game credits, and feel like a beginner gardener progressing toward professional equipment — all within a short browser session.

## Today’s scope vs later
| System | v0.1 today | v0.2+ later |
|---|---|---|
| Job board | Two cards, locked/unlocked status | More regions, customer ratings |
| Environment | One 3D backyard reused with 2 layouts | Multiple realistic yards, seasons |
| Tool catalog | 8 tools and compatibility matrix | Real 3D models, different motion modes |
| Interaction | Select tool then click target | Hold/drag strokes, collisions, sound |
| Rewards | Credits and simple shop | Upgrades, consumables, time economics |
| Education | One-sentence purpose/feedback | Verified tool instruction and safety content |
| Deployment | Public browser demo | Accounts, cloud storage, analytics |

## Two job designs
**Job 1 — Overgrown Lawn.** 6–8 targets across long-lawn, lawn-edge, weeds, and leaves. All tool types needed are available to starters. Aim for ~45–60 seconds for click-based first-play experience. Reward 500 game credits.

**Job 2 — Backyard Restoration.** 6–8 targets across leaves, hedges, marked fallen branch, and weeds. Unlock upon claimed reward from Job 1. Advanced catalog becomes buyable; automatic demo loaners prevent a soft-lock. Reward 350 game credits. Same base yard, different targets.

## Tool-to-target rules (game abstraction, not real operating instructions)
| Tool | Can affect | Differentiation |
|---|---|---|
| Leaf Rake | Leaves | basic manual option |
| String Trimmer | Weeds / edge tall grass | general-purpose edge tool |
| Lawn Mower | Long lawn | broad grass patches |
| Lawn Edger | Lawn edge | makes border visibly neat |
| Leaf Blower | Leaves | alternate to rake |
| Hedge Trimmer | Hedge | changes bush silhouette |
| Chainsaw | Marked fallen branch | branch transition; no technical training |
| Herbicide | Weeds | alternate to trimmer; abstract effect |

## Interaction contracts
- Tap/click a visible target to perform the chosen tool action.
- Wrong tool: concise explanatory feedback, no progression change.
- Appropriate tool: brief visual reaction; objective marked clean. No duplicate cleaning.
- Decorative elements do not count toward job completion.
- Once all required targets are cleaned: complete/claim reward once, return to task board.
- Non-owned advanced tools can be bought after Job 1; mission loaner ensures a no-deadlock demo.
- Reset clears all progression and returns to a ready-to-play state.

## Experience quality goals
- Every interactive object visually differs from static decoration.
- Tool selection and progress remain visible during play.
- One primary action on every screen; no ambiguous CTA.
- The before/after yard state is visibly different.
- No tutorial or detailed knowledge modules required today.

## Actual delivery constraints
- Existing local repo with Next.js 15, React 19, R3F, Zustand, Vitest. Phase 0 committed to `main` at `46de2689763a5ec41e8b836c91594a8ba3c4a27b` per Cursor report.
- Protect local-first workflow; use feature branch and verified push.
- Target good-looking but dependable procedural visuals first; optional trusted 3D assets later.
- Successful demo = two jobs end-to-end + GitHub push + public URL if deployment access available.
