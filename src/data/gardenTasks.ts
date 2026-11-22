import type { GardenTaskId } from "@/game/garden/types";
import { AREA_PLACEMENTS } from "./gardenPlacement";

export interface GardenTaskDef {
  id: GardenTaskId;
  name: string;
  prompt: string;
  /** Soft hotspot centre in garden world metres */
  center: [number, number, number];
  size: [number, number, number];
  camera: { position: [number, number, number]; target: [number, number, number] };
  tools: string[];
  discoverable: boolean;
  designPurpose: string;
  strengthsLimits: string;
}

function fromPlacement(
  id: GardenTaskId,
  extras: Omit<GardenTaskDef, "id" | "center" | "size" | "camera">,
): GardenTaskDef {
  const p = AREA_PLACEMENTS[id];
  return {
    id,
    center: p.hotspotCenter,
    size: p.hotspotSize,
    camera: {
      position: p.cameraPosition,
      target: p.cameraTarget,
    },
    ...extras,
  };
}

/**
 * Hotspots derived from docs/v06-scene-placement-audit.json + gardenPlacement.ts
 */
export const GARDEN_TASKS: GardenTaskDef[] = [
  fromPlacement("lawn", {
    name: "Front lawn",
    prompt: "Mow this lawn?",
    tools: ["manual-reel-mower", "lawn-mower"],
    discoverable: true,
    designPurpose:
      "Reel mower: narrow forward cut from rolling blades. Battery mower: wider powered pass.",
    strengthsLimits:
      "Powered is faster on open grass; reel is finer near flower borders. Battery empties with distance travelled.",
  }),
  fromPlacement("hedge", {
    name: "Side hedge",
    prompt: "Trim the east hedge?",
    tools: ["hand-hedge-shears", "hedge-trimmer"],
    discoverable: true,
    designPurpose:
      "Shears: precise local cuts. Powered trimmer: wider, faster sweeps along the hedge face.",
    strengthsLimits:
      "Powered can overcut and jam on thick wood. Clippings always fall to the ground below.",
  }),
  fromPlacement("flowerbed", {
    name: "Flower border",
    prompt: "Weed the flower border?",
    tools: ["hand-weeder", "string-trimmer"],
    discoverable: true,
    designPurpose:
      "Hand weeder pulls roots. String trimmer only cuts tops — roots remain.",
    strengthsLimits:
      "Top-cutting looks tidy briefly but weeds return. Pulling the wrong plant damages ornamentals.",
  }),
  fromPlacement("edge", {
    name: "Path edge",
    prompt: "Neaten the path edge?",
    tools: ["hand-edger", "string-trimmer"],
    discoverable: false,
    designPurpose:
      "Edging tools tidy the narrow strip a wide mower leaves against the path.",
    strengthsLimits:
      "A finished lawn can still look unfinished at the path — edge work is separate.",
  }),
  fromPlacement("debris", {
    name: "Fallen leaves & clippings",
    prompt: "Clear the ground debris?",
    tools: ["rake", "leaf-blower", "bag"],
    discoverable: true,
    designPurpose:
      "Rake gathers; blower pushes in the aim direction; bag only clears gathered piles nearby.",
    strengthsLimits:
      "Blowing a neat pile scatters it again. Bagging empty ground does nothing.",
  }),
  fromPlacement("hazard", {
    name: "Inspect hazards",
    prompt: "Check for stones and hard wood?",
    tools: [],
    discoverable: false,
    designPurpose: "Inspect reveals risks before powered tools hit them.",
    strengthsLimits:
      "Uncleared stone/wood blocks mowing or powered trimming in that patch only — not a full lockout.",
  }),
];

export function getGardenTask(id: string): GardenTaskDef | undefined {
  return GARDEN_TASKS.find((t) => t.id === id);
}
