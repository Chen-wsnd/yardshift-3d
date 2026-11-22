import type { GardeningTool } from "@/game/types";

/** Eight-tool registry — behavior is data-driven via compatibleTargets. */
export const TOOLS: GardeningTool[] = [
  {
    id: "rake",
    name: "Leaf Rake",
    category: "raking",
    description: "Gather leaves and light surface debris into piles.",
    realWorldPurpose:
      "Rakes collect fallen leaves so grass can breathe and sunlight can reach the soil.",
    purchasePrice: 0,
    ownedByDefault: true,
    compatibleTargets: ["leaves"],
    visualEffect: "shrink_fade",
    emoji: "🌿",
  },
  {
    id: "string-trimmer",
    name: "String Trimmer",
    category: "cutting",
    description: "Cut weeds and tall grass along edges.",
    realWorldPurpose:
      "String trimmers tidy areas a mower cannot reach, like fence lines and beds.",
    purchasePrice: 0,
    ownedByDefault: true,
    compatibleTargets: ["weeds", "tall_edge_grass"],
    visualEffect: "shorten_fade",
    emoji: "✂️",
  },
  {
    id: "lawn-mower",
    name: "Lawn Mower",
    category: "mowing",
    description: "Shorten broad patches of overgrown lawn.",
    realWorldPurpose:
      "Mowers keep turf at an even height for healthier growth and a neat look.",
    purchasePrice: 0,
    ownedByDefault: true,
    compatibleTargets: ["long_lawn"],
    visualEffect: "neaten_lawn",
    emoji: "🚜",
  },
  {
    id: "lawn-edger",
    name: "Lawn Edger",
    category: "edging",
    description: "Clean up jagged lawn borders.",
    realWorldPurpose:
      "Edgers create crisp borders between turf and hardscape or garden beds.",
    purchasePrice: 0,
    ownedByDefault: true,
    compatibleTargets: ["lawn_edge"],
    visualEffect: "clean_edge",
    emoji: "🔪",
  },
  {
    id: "leaf-blower",
    name: "Leaf Blower",
    category: "blowing",
    description: "Quickly disperse leaf clusters.",
    realWorldPurpose:
      "Blowers move dry leaves and light debris faster across large surfaces.",
    purchasePrice: 45,
    ownedByDefault: false,
    compatibleTargets: ["leaves"],
    visualEffect: "disperse_fade",
    emoji: "💨",
  },
  {
    id: "hedge-trimmer",
    name: "Hedge Trimmer",
    category: "cutting",
    description: "Shape overgrown hedges and bushes.",
    realWorldPurpose:
      "Hedge trimmers keep shrubs shaped and encourage denser healthy growth.",
    purchasePrice: 70,
    ownedByDefault: false,
    compatibleTargets: ["hedge"],
    visualEffect: "shape_hedge",
    emoji: "🪵",
  },
  {
    id: "chainsaw",
    name: "Chainsaw",
    category: "cutting",
    description: "Clear a marked fallen branch (game abstraction).",
    realWorldPurpose:
      "Chainsaws handle thick wood that hand tools cannot cut efficiently.",
    purchasePrice: 100,
    ownedByDefault: false,
    compatibleTargets: ["fallen_branch"],
    visualEffect: "cut_branch",
    emoji: "⚡",
  },
  {
    id: "herbicide",
    name: "Herbicide",
    category: "chemical",
    description: "Fade stubborn weed patches (game abstraction only).",
    realWorldPurpose:
      "Targeted weed treatments reduce invasive plants that compete with turf.",
    purchasePrice: 65,
    ownedByDefault: false,
    compatibleTargets: ["weeds"],
    visualEffect: "fade_weeds",
    emoji: "🧪",
  },
];

/** @deprecated Use TOOLS — alias for Phase 0 imports. */
export const SAMPLE_TOOLS = TOOLS;

export function getToolById(id: string): GardeningTool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export const STARTER_TOOL_IDS = TOOLS.filter((t) => t.ownedByDefault).map(
  (t) => t.id,
);

export const ADVANCED_TOOL_IDS = TOOLS.filter((t) => !t.ownedByDefault).map(
  (t) => t.id,
);
