# Contributing — YardShift 3D

## Branch model

| Branch | Purpose |
| --- | --- |
| `main` | Stable integrated version only |
| `feature/yard-interactions` | Developer A — 3D yard |
| `feature/jobs-economy` | Developer B — jobs, tools, economy, rules |
| `feature/ui-dashboard` | Developer C — UI, navigation, chrome |
| `feature/tutorial-system` | Developer C — onboarding |

Name short-lived branches as `feature/<area>-<detail>` or `fix/<area>-<detail>`.

## Workflow

1. Pull latest `main`.
2. Branch from `main` into your ownership area.
3. Implement + test locally (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` as relevant).
4. Open a PR into `main` (or an integration branch if the Integrator requests one).
5. Integrator reviews shared contracts / store impact, then merges.

Do **not** force-push to `main`. Do **not** commit secrets or `.env` files.

## Module boundaries

| Owner | May change freely | Coordinate first |
| --- | --- | --- |
| Developer A | `src/features/yard/**`, `public/assets/**` | Types for `Yard` / `YardObject`, store fields used by the scene |
| Developer B | `jobs`, `tools`, `economy`, `game/rules`, `data` | `game/types`, `game/store` shape |
| Developer C | `components`, `app` routes/layout, `tutorial` | Route contracts, store selectors used by UI |
| Integrator | `game/types`, `game/store`, docs, release PRs | Anything cross-cutting |

Do not edit another developer’s internal feature files without a quick sync (chat or PR comment). Prefer extending public exports (`index.ts`) and shared types.

## Pull requests

- Title: imperative, scoped — e.g. `feat(yard): add raycast object picking`
- Description: what / why, screenshots or clips for UI/3D, test notes
- Keep PRs small enough to review in one sitting when possible
- Shared type or store changes: call out in the PR body and request Integrator review
- CI / local checks should be green before merge

## Commits

Prefer conventional-ish prefixes: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

Example: `feat(jobs): gate accept on required tools`

## Local verification checklist

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev   # smoke-check / and /yard in the browser
```

Confirm `/yard` loads without SSR/WebGL console errors before merging 3D changes.
