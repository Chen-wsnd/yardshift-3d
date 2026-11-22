export interface SceneLayout {
  jobId: string;
  name: string;
  houseColor: string;
  roofColor: string;
  patio: { x: number; z: number; w: number; d: number };
  path: { x: number; z: number; w: number; d: number };
  tree: [number, number, number];
  fenceStyle: "wood" | "picket";
}

export const SCENE_LAYOUTS: Record<string, SceneLayout> = {
  "job-overgrown-lawn": {
    jobId: "job-overgrown-lawn",
    name: "Maple Lane",
    houseColor: "#f0e6d2",
    roofColor: "#6b5344",
    patio: { x: 0, z: -7.2, w: 4, d: 2.2 },
    path: { x: 0, z: 0, w: 1.6, d: 10 },
    tree: [5.5, 0, -5],
    fenceStyle: "wood",
  },
  "job-backyard-restoration": {
    jobId: "job-backyard-restoration",
    name: "Willow House",
    houseColor: "#c9d6c2",
    roofColor: "#3f4a3a",
    patio: { x: -2, z: 3.5, w: 5.5, d: 3.5 },
    path: { x: 1, z: -1, w: 1.4, d: 8 },
    tree: [-6, 0, -5.5],
    fenceStyle: "picket",
  },
};
