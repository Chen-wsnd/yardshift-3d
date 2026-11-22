# Roadmap — YardShift 3D

## Phase 0 — Project foundation (current)

**Goal:** Runnable shell with clear modules for parallel work.

Acceptance criteria:

- [x] Next.js App Router + TypeScript strict + Tailwind + R3F/Drei + Zustand + ESLint + Vitest
- [x] Folder structure with feature boundaries and docs
- [x] Dashboard shows title, sample job, Accept Job
- [x] Navigable client-only 3D yard (ground, grass, fence, objects, orbit/zoom)
- [x] Tool selection UI + extensible tool metadata
- [x] Economy types + balance indicator (no full shop yet)
- [x] Shared domain types + sample data
- [x] At least one meaningful domain test
- [x] Lint / typecheck / production build succeed

## Phase 1 — Yard interactions

**Goal:** Tools affect yard objects; basic cleanup feedback.

Acceptance criteria:

- [ ] Click/raycast select yard objects
- [ ] Selected tool validates against `requiredToolCategory`
- [ ] Cleaning an object updates store (`cleaned: true`) and shows feedback
- [ ] Job progress reflects remaining unclean objects
- [ ] No SSR regressions on `/yard`

Owner focus: Developer A (3D) + Developer B (rules)

## Phase 2 — Jobs & economy loop

**Goal:** Accept → clean → complete → reward → optional tool purchase.

Acceptance criteria:

- [ ] Complete job when all required objects are cleaned
- [ ] Credit payout via rules helpers + store update
- [ ] Simple shop UI to buy locked tools
- [ ] Second sample job unlocked by progression
- [ ] Tests for payout and purchase validation

Owner focus: Developer B + Developer C (UI)

## Phase 3 — Tutorial & education

**Goal:** Onboarding that teaches tool purposes without blocking play.

Acceptance criteria:

- [ ] First-run tutorial overlay / tips (`features/tutorial`)
- [ ] Educational panels tied to tools and object types
- [ ] Skip / resume tutorial stored in `GameProgress`
- [ ] Copy reviewed for real-world accuracy

Owner focus: Developer C + light support from B

## Phase 4 — Polish & hackathon demo

**Goal:** Demo-ready experience with clearer visuals and robustness.

Acceptance criteria:

- [ ] Improved yard visuals (still may use primitives or light assets)
- [ ] Audio or VFX cues for clean/complete (optional)
- [ ] Mobile-friendly controls baseline
- [ ] Demo script / README “Demo mode” section
- [ ] `main` stable for presentation

Owner focus: All + Integrator

## Out of scope (all phases unless explicitly added)

- Real payments, accounts, remote multiplayer
- External AI services
- Production backend / database
