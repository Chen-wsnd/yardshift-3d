# YardShift — Decisions & Polish Backlog

**Not required to block v0.1.** We will debate and refine these AFTER the first full playable build is running. Any change must preserve the one-click interaction engine and two-job loop until a working alternative is verified.

## Visual choices to discuss
- [ ] Visual style: light stylized realism / semi-realistic PBR / full photorealism (higher performance and sourcing risk).
- [ ] Camera: high isometric angle versus third-person gardener (for v0.1 use orbit camera).
- [ ] Yard asset source: authored procedural scene, independent models, or an imported full backyard (full scene may prevent separating cleanup objects).
- [ ] Visual weather/time of day, improved lighting/shadows, clean/dirty transitions.
- [ ] Device target: desktop priority versus touch-first.

## Interaction choices to discuss
- [ ] Click-to-clean vs hold-to-clean vs brush/drag. Use click for v0.1, then prototype one advanced mechanism.
- [ ] Instant clean vs progress/efficiency simulation: v0.1 instant with quick animation.
- [ ] Player represented by visible gardener/avatar or camera-only interaction.
- [ ] Tool quality differences: area of effect, speed, consumable cost, noise, reliability.
- [ ] UI placement: right tool dock, bottom toolbar, or radial equipment wheel.

## Content and progression to discuss
- [ ] Exact number of targets per job after real user playtest.
- [ ] Whether advanced tools should be purchased or unlocked as mission loaners for the demo.
- [ ] Unlock cadence, reward amounts and shop balancing (all placeholder game credits today).
- [ ] More tools: tiller, shovel, pressure washer, wheelbarrow, brush cutter.
- [ ] True gardening education, tool usage and chemical safety content — requires separate later verification.
- [ ] More interesting jobs such as gutter, patio, overgrown garden beds.

## Product quality checks after Cursor reports
- [ ] First-time visitor identifies what to click without explanation.
- [ ] Both jobs actually completable; no lock or purchase deadlock.
- [ ] Garden looks sufficiently believable after assets.
- [ ] Low latency and reliable interactions on a typical laptop.
- [ ] Public Vercel demo loads without missing asset fetches or hydration errors.
- [ ] Gameplay no longer than necessary; someone can see the concept in <2–3 minutes total.

## Review protocol
Each issue goes into one of three categories: `BLOCKS_RELEASE`, `VISUAL_POLISH`, `LATER_DESIGN`. Fix only release blockers before shipping. Visual and design choices are discussed and selected in follow-up without rewriting the foundation.
