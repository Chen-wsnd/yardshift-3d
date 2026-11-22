"use client";

import { useGameStore } from "@/game/store/gameStore";
import type { YardObject } from "@/game/types";

function ObjectMesh({ object }: { object: YardObject }) {
  const [x, y, z] = object.position;
  const scale = object.scale ?? [1, 1, 1];

  switch (object.kind) {
    case "leaf_pile":
      return (
        <mesh position={[x, y, z]} scale={scale} castShadow>
          <sphereGeometry args={[0.6, 12, 8]} />
          <meshStandardMaterial color="#c4a35a" roughness={1} />
        </mesh>
      );
    case "weed":
      return (
        <group position={[x, y, z]} scale={scale}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <coneGeometry args={[0.25, 0.7, 6]} />
            <meshStandardMaterial color="#3d6b3a" />
          </mesh>
        </group>
      );
    case "debris":
      return (
        <mesh position={[x, y, z]} scale={scale} castShadow rotation={[0.2, 0.4, 0.1]}>
          <boxGeometry args={[0.8, 0.15, 0.4]} />
          <meshStandardMaterial color="#7a6548" />
        </mesh>
      );
    case "bush":
      return (
        <mesh position={[x, y, z]} scale={scale} castShadow>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#2f5c2c" flatShading />
        </mesh>
      );
    case "tree":
      return (
        <group position={[x, 0, z]} scale={scale}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 2, 8]} />
            <meshStandardMaterial color="#5c4030" />
          </mesh>
          <mesh position={[0, 2.6, 0]} castShadow>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color="#2d5a28" />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh position={[x, y, z]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      );
  }
}

export function YardObjects() {
  const objects = useGameStore((state) => state.yard.objects);

  return (
    <group>
      {objects
        .filter((obj) => !obj.cleaned)
        .map((obj) => (
          <ObjectMesh key={obj.id} object={obj} />
        ))}
    </group>
  );
}
