import type { GardeningTool } from "@/game/types";

/** Phase 0 sample tools — extend via data, not hard-coded UI. */
export const SAMPLE_TOOLS: GardeningTool[] = [
  {
    id: "tool-rake",
    name: "Leaf Rake",
    category: "raking",
    description: "Gather leaves and light surface debris into piles.",
    realWorldPurpose:
      "Rakes collect fallen leaves and thatch so grass can breathe and sunlight can reach the soil.",
    purchasePrice: 0,
    ownedByDefault: true,
  },
  {
    id: "tool-shears",
    name: "Hand Shears",
    category: "cutting",
    description: "Trim small branches and overgrown bushes.",
    realWorldPurpose:
      "Hand shears make clean cuts on soft growth, reducing plant stress compared to tearing stems by hand.",
    purchasePrice: 45,
    ownedByDefault: true,
  },
];

export function getToolById(id: string): GardeningTool | undefined {
  return SAMPLE_TOOLS.find((tool) => tool.id === id);
}
