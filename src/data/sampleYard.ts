import type { Yard } from "@/game/types";

/** One backyard layout with procedural-friendly object markers. */
export const SAMPLE_YARD: Yard = {
  id: "yard-maple-lane",
  name: "Maple Lane Backyard",
  width: 20,
  depth: 16,
  objects: [
    {
      id: "obj-leaf-pile-1",
      kind: "leaf_pile",
      label: "Fallen leaf pile",
      position: [-3, 0.2, 2],
      scale: [1.4, 0.4, 1.2],
      cleaned: false,
      requiredToolCategory: "raking",
    },
    {
      id: "obj-weed-1",
      kind: "weed",
      label: "Weed patch",
      position: [2.5, 0.15, -1.5],
      scale: [0.6, 0.5, 0.6],
      cleaned: false,
      requiredToolCategory: "digging",
    },
    {
      id: "obj-debris-1",
      kind: "debris",
      label: "Scattered twigs",
      position: [1, 0.1, 3],
      scale: [1, 0.2, 0.8],
      cleaned: false,
      requiredToolCategory: "cleanup",
    },
    {
      id: "obj-bush-1",
      kind: "bush",
      label: "Overgrown bush",
      position: [-5, 0.6, -4],
      scale: [1.2, 1.2, 1.2],
      cleaned: false,
      requiredToolCategory: "cutting",
    },
    {
      id: "obj-tree-1",
      kind: "tree",
      label: "Maple tree",
      position: [6, 0, -5],
      scale: [1, 1, 1],
      cleaned: false,
    },
  ],
};
