"use client";

import { useGameStore } from "@/game/store/gameStore";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { LawnFootprintLayer } from "./LawnFootprintLayer";

/** Same fine-lawn state as the task stage — overview LOD via same instances. */
export function LawnOverviewOverlay() {
  const job = useGameStore((s) => s.work.jobs[V03_GARDEN_JOB_ID]);
  const zone = job?.zones.find((z) => z.id === LAWN_ZONE_ID);
  if (!zone) return null;
  return <LawnFootprintLayer cells={zone.cells} y={0.05} />;
}
