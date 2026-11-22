/** Gate 0 / Gate 1 — Saturday morning back garden overview adaptations. */

export const GARDEN_SCENE = {
  id: "saturday-morning-back-garden",
  localPath: "/assets/models/yardshift-kit/saturday-morning-back-garden.glb",
  sourceUrl: "https://cdn.3dassets.dev/assets/27418/v1/model.glb",
  pageUrl:
    "https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene",
  license: "CC0 1.0 Universal",
  creator: "3D Assets (@3dassets)",
  sha256:
    "db81ef3047e14e8c53643c82308fdafa22575e3fe15911c39df85aa54cb778e0",
  triangles: 37136,
  nodes: 636,
  meshes: 284,
  animations: 0,
} as const;

/**
 * Nodes whose baked narrative state conflicts with player-driven lawn work.
 * Matched as substring against GLTF node names (case-insensitive).
 */
export const GARDEN_HIDE_NAME_MATCHES = [
  // Baked half-mowed lawn — replaced by state-driven kit strips
  "lawn-tile-2m-striped",
  "lawn-tile-2m-uncut",
  "lawn-tile-2m-cut",
  // Characters / NPCs
  "mowing-hero",
  "dog-walker",
  "grumpy-neighbour",
  "delivery-driver",
  "lawn-perfectionist",
  "teen-with-headphones",
  // Mid-job / joke mowers that contradict player tool ownership
  "self-propelled-mower",
  "robot-mower",
  "giant-mega-mower",
  "leaderboard-sign",
] as const;

/** Soft lawn hotspot in overview (world units matching kit meters). */
export const LAWN_HOTSPOT = {
  zoneId: "j1-lawn",
  label: "Front lawn",
  confirmPrompt: "Mow this lawn?",
  center: [0, 0.05, 0] as [number, number, number],
  size: [10, 0.05, 8] as [number, number, number],
};

/** Fixed three-quarter overview camera. */
export const OVERVIEW_CAMERA = {
  position: [12, 9, 14] as [number, number, number],
  target: [0, 0.4, 0] as [number, number, number],
  fov: 42,
};

/** Close-up lawn task camera. */
export const LAWN_TASK_CAMERA = {
  position: [2, 9, 9] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 42,
};
