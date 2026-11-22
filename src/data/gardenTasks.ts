import type { GardenTaskId } from "@/game/garden/types";

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
}

/**
 * Hotspots measured against Saturday morning back garden layout
 * (lawn ~x±5 z±4; hedges east ~x5–6; flower border east lawn; leaves south).
 */
export const GARDEN_TASKS: GardenTaskDef[] = [
  {
    id: "lawn",
    name: "Front lawn",
    prompt: "Mow this lawn?",
    center: [0, 0.05, 0],
    size: [10, 0.05, 8],
    camera: { position: [2, 9, 9], target: [0, 0, 0] },
    tools: ["manual-reel-mower", "lawn-mower"],
    discoverable: true,
  },
  {
    id: "hedge",
    name: "Side hedge",
    prompt: "Trim the side hedge?",
    center: [5.4, 0.6, 0],
    size: [2.2, 0.05, 8],
    camera: { position: [9, 5, 4], target: [5.4, 0.8, 0] },
    tools: ["hand-hedge-shears", "hedge-trimmer"],
    discoverable: true,
  },
  {
    id: "flowerbed",
    name: "Flower border",
    prompt: "Weed the flower border?",
    center: [4.1, 0.1, 3.1],
    size: [2.4, 0.05, 2.2],
    camera: { position: [6, 4, 6], target: [4.1, 0.2, 3.1] },
    tools: ["hand-weeder", "string-trimmer"],
    discoverable: true,
  },
  {
    id: "edge",
    name: "Path edge",
    prompt: "Neaten the path edge?",
    center: [0, 0.05, 4.2],
    size: [8, 0.05, 1.4],
    camera: { position: [0, 6, 9], target: [0, 0, 4] },
    tools: ["hand-edger", "string-trimmer"],
    discoverable: false,
  },
  {
    id: "debris",
    name: "Fallen leaves & clippings",
    prompt: "Clear the ground debris?",
    center: [-2.5, 0.05, -4.5],
    size: [6, 0.05, 2.5],
    camera: { position: [-2, 7, -1], target: [-2.5, 0, -4.5] },
    tools: ["rake", "leaf-blower", "bag"],
    discoverable: true,
  },
  {
    id: "hazard",
    name: "Inspect hazards",
    prompt: "Check for stones and hard wood?",
    center: [-3.6, 0.08, 3.1],
    size: [1.8, 0.05, 1.8],
    camera: { position: [-1, 6, 6], target: [-3.6, 0.1, 3.1] },
    tools: [],
    discoverable: false,
  },
];

export function getGardenTask(id: string): GardenTaskDef | undefined {
  return GARDEN_TASKS.find((t) => t.id === id);
}
