# Tool knowledge sources (display claims only)

Simulation numbers stay in `equipmentProfiles.ts`. Claims below are for copy / teaching boundaries.

| sourceId | URL | Claim used in game | Applicability | Limit | checkedOn |
|---|---|---|---|---|---|
| ccohs-rotary | https://www.ccohs.ca/oshanswers/safety_haz/landscaping/rotary.html | Check for stones before spinning blades; stop for maintenance | Lawn hazard inspect / local block | Not full real mower certification (`NOT_SIMULATED`) | 2026-11-22 |
| umass-lawn-mowing | https://ag.umass.edu/turf/fact-sheets/mowing-practices | Mowing practices / careful passes near borders | Manual reel vs powered deck contrast | Height physiology **not** simulated | 2026-11-22 |
| umn-mowing | https://extension.umn.edu/lawn-care/mowing-practices-healthy-lawns | One-third leaf rule / clippings can stay | Optional background only | Height physiology **not** simulated | 2026-11-22 |
| rhs-hedge-trim | https://www.rhs.org.uk/plants/types/hedges/how-to-trim-a-hedge | Soft growth vs longer powered runs; watch surroundings | Hedge shears vs trimmer | Bird-nest hard lock **not** simulated | 2026-11-22 |
| umd-weeds | https://extension.umd.edu/resource/manage-weeds-without-chemicals-maryland | Tops vs roots | String trimmer vs hand weeder | No guarantee weeds never return | 2026-11-22 |
| ucipm-string | https://ipm.ucanr.edu/PMG/PESTNOTES/pn7441.html | String trimmer cuts tops; care near ornamentals | String trimmer flowerbed/edge | Not a full IPM program (`NOT_SIMULATED`) | 2026-11-22 |
| isu-leaves | https://hortnews.extension.iastate.edu/leave-leaves | Bagging is this visit’s task, not only real option | Debris rake / blower / bag copy | Compost/mulch paths not playable | 2026-11-22 |
| umn-leaves | https://extension.umn.edu/lawncare/leave-leaves | Leave-the-leaves is a real option outside this visit | Background for debris realism note | Compost/mulch paths not playable | 2026-11-22 |

Status legend: `VERIFIED_SOURCE` (URL checked for wording) · `SIMULATED_MODEL` (game numbers) · `NOT_SIMULATED`.

Every non-empty `sourceIds` entry in `src/game/learning/toolKnowledge.ts` must appear in this table (enforced by unit test).
