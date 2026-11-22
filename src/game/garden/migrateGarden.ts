import { MEASURED_DANDELIONS } from "@/data/gardenPlacement";
import { createEdgeSegments } from "./edgeFixtures";
import type { GardenDomain, PlantEntity } from "./types";

/** West flowerbed operable strip — same layout as createPlants(). */
const BED_X0 = -6.0;
const BED_Z0 = 1.6;

const OLD_LAWN_WEED_IDS = new Set(MEASURED_DANDELIONS.map((d) => d.id));

function nearMeasuredLawnSpot(p: PlantEntity): boolean {
  return MEASURED_DANDELIONS.some(
    (d) =>
      (d.id === p.id || Math.hypot(d.x - p.x, d.z - p.z) < 0.35) &&
      Math.hypot(p.x - BED_X0, p.z - BED_Z0) > 2.5,
  );
}

function inOperableFlowerbed(p: PlantEntity): boolean {
  return p.x >= -6.6 && p.x <= -5.4 && p.z >= 1.2 && p.z <= 4.2;
}

/**
 * One-shot relocate of legacy distant completion weeds into the west bed.
 * Preserves rootRemoved / topCut / ornamentalDamage and stable IDs (P1-01).
 */
function migratePlants(
  plants: Record<string, PlantEntity>,
): Record<string, PlantEntity> {
  const out: Record<string, PlantEntity> = {};
  let relocateIndex = 0;
  for (const [id, p] of Object.entries(plants ?? {})) {
    let next: PlantEntity = {
      ...p,
      countsTowardCompletion: p.countsTowardCompletion ?? true,
    };
    const needsRelocate =
      next.kind === "weed" &&
      next.countsTowardCompletion !== false &&
      !next.rootRemoved &&
      !inOperableFlowerbed(next) &&
      (OLD_LAWN_WEED_IDS.has(id) || nearMeasuredLawnSpot(next));
    if (needsRelocate) {
      // Deterministic slot from id hash so rehydrate is idempotent
      const slot =
        MEASURED_DANDELIONS.findIndex((d) => d.id === id) >= 0
          ? MEASURED_DANDELIONS.findIndex((d) => d.id === id)
          : relocateIndex++;
      next = {
        ...next,
        x: BED_X0 + (slot % 2) * 0.25,
        z: BED_Z0 + slot * 0.45,
      };
    }
    out[id] = next;
  }
  return out;
}

/** Ensure older nested garden domains gain edge, cleanup, and visitHistory. */
export function migrateGardenDomain(garden: GardenDomain): GardenDomain {
  const edgeSegments =
    garden.edgeSegments && Object.keys(garden.edgeSegments).length > 0
      ? garden.edgeSegments
      : createEdgeSegments();
  return {
    ...garden,
    schemaVersion: 3,
    edgeSegments,
    cleanupHistory: garden.cleanupHistory ?? [],
    focusPoint: garden.focusPoint ?? null,
    visitFinished: garden.visitFinished ?? false,
    lastVisitNote: garden.lastVisitNote ?? null,
    visitHistory: garden.visitHistory ?? [],
    plants: migratePlants(garden.plants ?? {}),
  };
}
