/**
 * Measure world bounds of semantic nodes in saturday-morning-back-garden.glb.
 * Provenance: MEASURED from local GLB via Three.js Box3.setFromObject.
 * Run: node scripts/inspectGardenScene.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const glbPath = join(
  root,
  "public/assets/models/yardshift-kit/saturday-morning-back-garden.glb",
);

const INTEREST = [
  "hedge-block",
  "hedge-corner",
  "path-slab",
  "dandelion-clump",
  "flower-bed-border",
  "lawn-tile",
  "compost-bin",
  "wheelie-bin",
  "garden-shed",
];

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function measure(obj) {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj, true);
  if (box.isEmpty()) return null;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return {
    min: [round3(box.min.x), round3(box.min.y), round3(box.min.z)],
    max: [round3(box.max.x), round3(box.max.y), round3(box.max.z)],
    center: [round3(center.x), round3(center.y), round3(center.z)],
    size: [round3(size.x), round3(size.y), round3(size.z)],
  };
}

function parseGlb(buffer) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(
      buffer,
      "",
      (gltf) => resolve(gltf),
      (err) => reject(err),
    );
  });
}

const raw = readFileSync(glbPath);
const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
const gltf = await parseGlb(ab);
const scene = gltf.scene;
scene.updateWorldMatrix(true, true);

const sceneBounds = measure(scene);
const nodes = [];

scene.traverse((obj) => {
  if (!obj.name) return;
  const lower = obj.name.toLowerCase();
  if (!INTEREST.some((k) => lower.includes(k))) return;
  // Prefer parent-ish named nodes without /N mesh children suffixes when possible
  if (obj.name.includes("/") && !obj.name.endsWith("/0")) return;
  const m = measure(obj);
  if (!m) return;
  nodes.push({
    name: obj.name,
    type: obj.type,
    localPosition: [
      round3(obj.position.x),
      round3(obj.position.y),
      round3(obj.position.z),
    ],
    world: m,
    provenance: "MEASURED",
  });
});

nodes.sort((a, b) => a.name.localeCompare(b.name));

function cluster(filterFn) {
  const subset = nodes.filter(filterFn);
  if (!subset.length) return null;
  const box = new THREE.Box3();
  for (const n of subset) {
    box.expandByPoint(new THREE.Vector3(...n.world.min));
    box.expandByPoint(new THREE.Vector3(...n.world.max));
  }
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return {
    sourceNodeNames: subset.map((n) => n.name),
    count: subset.length,
    min: [round3(box.min.x), round3(box.min.y), round3(box.min.z)],
    max: [round3(box.max.x), round3(box.max.y), round3(box.max.z)],
    center: [round3(center.x), round3(center.y), round3(center.z)],
    size: [round3(size.x), round3(size.y), round3(size.z)],
    provenance: "MEASURED_CLUSTER",
  };
}

// Prefer a continuous east-side hedge band (higher X) for interactivity
const hedgeNodes = nodes.filter((n) =>
  /hedge-block|hedge-corner/i.test(n.name),
);
hedgeNodes.sort((a, b) => b.world.center[0] - a.world.center[0]);
const eastHedges = hedgeNodes.filter((n) => n.world.center[0] > 3.5);
const hedgeCluster =
  cluster((n) => eastHedges.some((e) => e.name === n.name)) ??
  cluster((n) => /hedge-block|hedge-corner/i.test(n.name));

const areas = {
  lawn: cluster((n) => /lawn-tile/i.test(n.name)),
  hedge_east: hedgeCluster,
  flowerbed: cluster((n) => /flower-bed-border|dandelion-clump/i.test(n.name)),
  path: cluster((n) => /path-slab/i.test(n.name)),
  shed: cluster((n) => /garden-shed/i.test(n.name)),
};

const audit = {
  generatedAt: new Date().toISOString(),
  glbPath: "public/assets/models/yardshift-kit/saturday-morning-back-garden.glb",
  method:
    "THREE.GLTFLoader + Box3.setFromObject after updateWorldMatrix(true,true)",
  sceneBounds,
  groundY: sceneBounds?.min?.[1] ?? 0,
  areas,
  nodes,
};

mkdirSync(join(root, "docs"), { recursive: true });
const outJson = join(root, "docs/v06-scene-placement-audit.json");
writeFileSync(outJson, JSON.stringify(audit, null, 2));

// Emit a compact TS-friendly placement snippet for gardenTasks
const placement = {};
for (const [id, a] of Object.entries(areas)) {
  if (!a) continue;
  placement[id] = {
    center: a.center,
    size: a.size,
    sourceNodeNames: a.sourceNodeNames,
    provenance: a.provenance,
  };
}
writeFileSync(
  join(root, "docs/v06-scene-placement-areas.json"),
  JSON.stringify(placement, null, 2),
);

console.log("Wrote", outJson);
console.log("Scene bounds", sceneBounds);
console.log("Areas:");
for (const [k, v] of Object.entries(areas)) {
  if (!v) {
    console.log(" ", k, "MISSING");
    continue;
  }
  console.log(
    `  ${k}: center=${v.center.join(",")} size=${v.size.join(",")} nodes=${v.count}`,
  );
}
console.log("Nodes measured:", nodes.length);
