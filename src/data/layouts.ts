import type { Yard, YardLayout, YardObject } from "@/game/types";

const BASE_YARD_ID = "yard-maple-lane";

function obj(
  partial: Omit<YardObject, "cleaned" | "interactionState"> & {
    cleaned?: boolean;
    interactionState?: YardObject["interactionState"];
  },
): YardObject {
  const isDecorative = partial.targetKind === "decorative" || !partial.isObjective;
  return {
    cleaned: partial.cleaned ?? false,
    interactionState:
      partial.interactionState ??
      (isDecorative ? "decorative" : "dirty"),
    ...partial,
  };
}

/** Shared decorative props present in every layout. */
const DECOR: YardObject[] = [
  obj({
    id: "decor-tree",
    kind: "tree",
    label: "Maple tree",
    position: [7, 0, -5.5],
    scale: [1, 1, 1],
    targetKind: "decorative",
    isObjective: false,
  }),
  obj({
    id: "decor-path",
    kind: "prop",
    label: "Stone path",
    position: [0, 0.02, 0],
    scale: [1.6, 0.05, 8],
    targetKind: "decorative",
    isObjective: false,
  }),
  obj({
    id: "decor-bush-static",
    kind: "bush",
    label: "Garden bush",
    position: [-7, 0.5, 5],
    scale: [0.9, 0.9, 0.9],
    targetKind: "decorative",
    isObjective: false,
  }),
];

/** Job 1 — Overgrown Lawn: 8 required targets. */
export const LAYOUT_OVERGROWN_LAWN: YardLayout = {
  id: "layout-overgrown-lawn",
  yardId: BASE_YARD_ID,
  jobId: "job-overgrown-lawn",
  name: "Overgrown Lawn",
  objects: [
    ...DECOR,
    obj({
      id: "j1-lawn-1",
      kind: "lawn",
      label: "Long lawn patch A",
      position: [-3.5, 0.05, 2],
      scale: [2.4, 0.12, 1.8],
      targetKind: "long_lawn",
      isObjective: true,
      recommendedToolId: "lawn-mower",
    }),
    obj({
      id: "j1-lawn-2",
      kind: "lawn",
      label: "Long lawn patch B",
      position: [3, 0.05, -1],
      scale: [2.2, 0.12, 1.6],
      targetKind: "long_lawn",
      isObjective: true,
      recommendedToolId: "lawn-mower",
    }),
    obj({
      id: "j1-edge-1",
      kind: "edge",
      label: "Messy lawn edge A",
      position: [-6, 0.08, 0],
      scale: [0.35, 0.15, 3.2],
      targetKind: "lawn_edge",
      isObjective: true,
      recommendedToolId: "lawn-edger",
    }),
    obj({
      id: "j1-edge-2",
      kind: "edge",
      label: "Messy lawn edge B",
      position: [6.2, 0.08, 1.5],
      scale: [0.35, 0.15, 2.8],
      targetKind: "lawn_edge",
      isObjective: true,
      recommendedToolId: "lawn-edger",
    }),
    obj({
      id: "j1-weed-1",
      kind: "weed",
      label: "Tall edge weeds",
      position: [-2, 0.2, -4],
      scale: [0.7, 0.8, 0.7],
      targetKind: "tall_edge_grass",
      isObjective: true,
      recommendedToolId: "string-trimmer",
    }),
    obj({
      id: "j1-weed-2",
      kind: "weed",
      label: "Weed cluster",
      position: [4.5, 0.2, 3.5],
      scale: [0.65, 0.75, 0.65],
      targetKind: "weeds",
      isObjective: true,
      recommendedToolId: "string-trimmer",
    }),
    obj({
      id: "j1-leaves-1",
      kind: "leaf_pile",
      label: "Scattered leaves A",
      position: [1.5, 0.15, 4],
      scale: [1.2, 0.35, 1],
      targetKind: "leaves",
      isObjective: true,
      recommendedToolId: "rake",
    }),
    obj({
      id: "j1-leaves-2",
      kind: "leaf_pile",
      label: "Scattered leaves B",
      position: [-4.5, 0.15, -2.5],
      scale: [1.1, 0.3, 0.9],
      targetKind: "leaves",
      isObjective: true,
      recommendedToolId: "rake",
    }),
  ],
};

/** Job 2 — Backyard Restoration: 7 required targets. */
export const LAYOUT_BACKYARD_RESTORATION: YardLayout = {
  id: "layout-backyard-restoration",
  yardId: BASE_YARD_ID,
  jobId: "job-backyard-restoration",
  name: "Backyard Restoration",
  objects: [
    ...DECOR,
    obj({
      id: "j2-leaves-1",
      kind: "leaf_pile",
      label: "Leaf pile A",
      position: [-3, 0.2, 3],
      scale: [1.5, 0.45, 1.3],
      targetKind: "leaves",
      isObjective: true,
      recommendedToolId: "leaf-blower",
    }),
    obj({
      id: "j2-leaves-2",
      kind: "leaf_pile",
      label: "Leaf pile B",
      position: [2.5, 0.2, -3],
      scale: [1.3, 0.4, 1.1],
      targetKind: "leaves",
      isObjective: true,
      recommendedToolId: "rake",
    }),
    obj({
      id: "j2-hedge-1",
      kind: "bush",
      label: "Overgrown hedge A",
      position: [-5.5, 0.7, -3],
      scale: [1.4, 1.3, 1.1],
      targetKind: "hedge",
      isObjective: true,
      recommendedToolId: "hedge-trimmer",
    }),
    obj({
      id: "j2-hedge-2",
      kind: "bush",
      label: "Overgrown hedge B",
      position: [5.5, 0.7, 2],
      scale: [1.3, 1.2, 1.1],
      targetKind: "hedge",
      isObjective: true,
      recommendedToolId: "hedge-trimmer",
    }),
    obj({
      id: "j2-branch-1",
      kind: "branch",
      label: "Fallen branch",
      position: [0.5, 0.25, 2.5],
      scale: [2.2, 0.25, 0.35],
      targetKind: "fallen_branch",
      isObjective: true,
      recommendedToolId: "chainsaw",
    }),
    obj({
      id: "j2-weed-1",
      kind: "weed",
      label: "Stubborn weed patch A",
      position: [-1.5, 0.2, -1.5],
      scale: [0.8, 0.7, 0.8],
      targetKind: "weeds",
      isObjective: true,
      recommendedToolId: "herbicide",
    }),
    obj({
      id: "j2-weed-2",
      kind: "weed",
      label: "Stubborn weed patch B",
      position: [4, 0.2, 4],
      scale: [0.75, 0.65, 0.75],
      targetKind: "weeds",
      isObjective: true,
      recommendedToolId: "string-trimmer",
    }),
  ],
};

export const YARD_LAYOUTS: YardLayout[] = [
  LAYOUT_OVERGROWN_LAWN,
  LAYOUT_BACKYARD_RESTORATION,
];

export const BASE_YARD: Yard = {
  id: BASE_YARD_ID,
  name: "Maple Lane Backyard",
  width: 20,
  depth: 16,
  objects: [],
};

export function getLayoutByJobId(jobId: string): YardLayout | undefined {
  return YARD_LAYOUTS.find((layout) => layout.jobId === jobId);
}

export function cloneLayoutObjects(layout: YardLayout): YardObject[] {
  return layout.objects.map((o) => ({ ...o, scale: o.scale ? [...o.scale] as [number, number, number] : undefined, position: [...o.position] as [number, number, number] }));
}

/** @deprecated Phase 0 alias — Job 1 layout. */
export const SAMPLE_YARD: Yard = {
  ...BASE_YARD,
  objects: cloneLayoutObjects(LAYOUT_OVERGROWN_LAWN),
};
