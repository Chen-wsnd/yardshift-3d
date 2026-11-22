"use client";

import { useMemo, useState } from "react";
import { useGameStore } from "@/game/store/gameStore";
import type { YardObject } from "@/game/types";

function ObjectMesh({
  object,
  onInteract,
}: {
  object: YardObject;
  onInteract: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cleaned =
    object.cleaned || object.interactionState === "cleaned";
  const interactive =
    object.isObjective && object.targetKind !== "decorative";
  const [x, y, z] = object.position;
  const scale = object.scale ?? [1, 1, 1];

  const highlight = hovered && interactive && !cleaned;

  const commonHandlers = interactive
    ? {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = cleaned ? "default" : "pointer";
        },
        onPointerOut: () => {
          setHovered(false);
          document.body.style.cursor = "auto";
        },
        onClick: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          if (!cleaned) onInteract(object.id);
        },
        onPointerDown: (e: { stopPropagation: () => void }) => {
          // Prevent OrbitControls drag starting on targets
          e.stopPropagation();
        },
      }
    : {};

  if (object.id === "decor-path") {
    return (
      <mesh position={[x, y, z]} scale={scale} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#9a958c" roughness={0.95} />
      </mesh>
    );
  }

  switch (object.targetKind) {
    case "long_lawn":
      return (
        <mesh
          position={[x, cleaned ? 0.03 : y, z]}
          scale={
            cleaned
              ? [scale[0], 0.04, scale[2]]
              : highlight
                ? [scale[0] * 1.05, scale[1] * 1.2, scale[2] * 1.05]
                : scale
          }
          castShadow
          receiveShadow
          {...commonHandlers}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={cleaned ? "#5fa85a" : highlight ? "#6bb85f" : "#3d6b2e"}
            roughness={0.9}
          />
        </mesh>
      );

    case "lawn_edge":
      return (
        <mesh
          position={[x, y, z]}
          scale={
            cleaned
              ? [scale[0] * 0.7, scale[1] * 0.5, scale[2]]
              : highlight
                ? [scale[0] * 1.15, scale[1] * 1.15, scale[2]]
                : scale
          }
          castShadow
          rotation={cleaned ? [0, 0, 0] : [0, 0.08, 0.05]}
          {...commonHandlers}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={cleaned ? "#6aad64" : highlight ? "#c4a35a" : "#8a6b2e"}
          />
        </mesh>
      );

    case "leaves":
      if (cleaned) return null;
      return (
        <mesh
          position={[x, y, z]}
          scale={highlight ? scale.map((s) => s * 1.08) as [number, number, number] : scale}
          castShadow
          {...commonHandlers}
        >
          <sphereGeometry args={[0.6, 12, 8]} />
          <meshStandardMaterial color={highlight ? "#e0b96a" : "#c4a35a"} roughness={1} />
        </mesh>
      );

    case "weeds":
    case "tall_edge_grass":
      if (cleaned) {
        return (
          <mesh position={[x, 0.05, z]} scale={[0.4, 0.15, 0.4]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshStandardMaterial color="#5d9458" />
          </mesh>
        );
      }
      return (
        <group position={[x, y, z]} scale={scale} {...commonHandlers}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.3, 0.85, 6]} />
            <meshStandardMaterial color={highlight ? "#5a9a4a" : "#3d6b3a"} />
          </mesh>
          <mesh position={[0.2, 0.25, 0.1]} castShadow>
            <coneGeometry args={[0.2, 0.55, 5]} />
            <meshStandardMaterial color="#2f5c2c" />
          </mesh>
        </group>
      );

    case "hedge":
      return (
        <mesh
          position={[x, cleaned ? y * 0.75 : y, z]}
          scale={
            cleaned
              ? [scale[0] * 0.9, scale[1] * 0.55, scale[2] * 0.85]
              : highlight
                ? scale.map((s) => s * 1.06) as [number, number, number]
                : scale
          }
          castShadow
          {...commonHandlers}
        >
          <boxGeometry args={[1.2, 1.2, 0.9]} />
          <meshStandardMaterial
            color={cleaned ? "#3f7a3a" : highlight ? "#4a8a44" : "#2f5c2c"}
            flatShading={!cleaned}
          />
        </mesh>
      );

    case "fallen_branch":
      if (cleaned) return null;
      return (
        <mesh
          position={[x, y, z]}
          scale={highlight ? [scale[0] * 1.05, scale[1] * 1.1, scale[2] * 1.1] : scale}
          castShadow
          rotation={[0.15, 0.4, 0.1]}
          {...commonHandlers}
        >
          <cylinderGeometry args={[0.12, 0.18, 1, 8]} />
          <meshStandardMaterial color={highlight ? "#8a6548" : "#5c4030"} />
        </mesh>
      );

    case "decorative":
    default:
      if (object.kind === "tree") {
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
      }
      if (object.kind === "bush") {
        return (
          <mesh position={[x, y, z]} scale={scale} castShadow>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#2f5c2c" flatShading />
          </mesh>
        );
      }
      return null;
  }
}

export function YardObjects() {
  const objects = useGameStore((state) => state.yard.objects);
  const interactWithObject = useGameStore((state) => state.interactWithObject);
  const lastFeedback = useGameStore((state) => state.progress.lastFeedback);

  const list = useMemo(() => objects, [objects]);

  return (
    <group>
      {list.map((obj) => (
        <ObjectMesh
          key={obj.id}
          object={obj}
          onInteract={interactWithObject}
        />
      ))}
      {/* keep feedback readable for a11y via DOM HUD; scene uses store */}
      <group visible={false}>
        <mesh userData={{ lastFeedback }} />
      </group>
    </group>
  );
}
