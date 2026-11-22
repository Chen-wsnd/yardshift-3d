"use client";

import type { SceneLayout } from "@/data/sceneLayouts";

/** Stylized rear facade — procedural, coherent with kit lighting. */
export function HouseFacade({ layout }: { layout: SceneLayout }) {
  const z = -8.6;
  return (
    <group>
      <mesh position={[0, 2.2, z]} castShadow receiveShadow>
        <boxGeometry args={[12, 4.4, 1.2]} />
        <meshStandardMaterial color={layout.houseColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.6, z]} castShadow>
        <boxGeometry args={[12.6, 0.6, 1.6]} />
        <meshStandardMaterial color={layout.roofColor} />
      </mesh>
      {/* door */}
      <mesh position={[0, 1.1, z + 0.65]}>
        <boxGeometry args={[1.1, 2.2, 0.1]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
      {/* windows */}
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 2.4, z + 0.65]}>
          <boxGeometry args={[1.4, 1.2, 0.08]} />
          <meshStandardMaterial color="#9ec3e0" roughness={0.3} />
        </mesh>
      ))}
      {/* patio slab */}
      <mesh
        position={[layout.patio.x, 0.04, layout.patio.z]}
        receiveShadow
      >
        <boxGeometry args={[layout.patio.w, 0.08, layout.patio.d]} />
        <meshStandardMaterial color="#b0aaa0" roughness={0.95} />
      </mesh>
      {/* path */}
      <mesh position={[layout.path.x, 0.03, layout.path.z]} receiveShadow>
        <boxGeometry args={[layout.path.w, 0.06, layout.path.d]} />
        <meshStandardMaterial color="#9a958c" />
      </mesh>
      {/* tree trunk/canopy */}
      <group position={layout.tree}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 2, 8]} />
          <meshStandardMaterial color="#5c4030" />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow>
          <sphereGeometry args={[1.2, 12, 12]} />
          <meshStandardMaterial color="#2d5a28" />
        </mesh>
      </group>
    </group>
  );
}
