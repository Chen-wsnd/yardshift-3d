"use client";

import { useMemo } from "react";
import type { TargetKind } from "@/game/types";

function GrassTuft({
  position,
  height,
  color,
}: {
  position: [number, number, number];
  height: number;
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <coneGeometry args={[0.08, height, 5]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function LongLawnVisual({
  cleaned,
  highlight,
  scale,
}: {
  cleaned: boolean;
  highlight: boolean;
  scale: [number, number, number];
}) {
  const tufts = useMemo(() => {
    const items: { p: [number, number, number]; h: number }[] = [];
    const cols = 5;
    const rows = 4;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i / (cols - 1) - 0.5) * 0.85;
        const z = (j / (rows - 1) - 0.5) * 0.85;
        items.push({
          p: [x, cleaned ? 0.08 : 0.18 + ((i + j) % 3) * 0.04, z],
          h: cleaned ? 0.12 : 0.35 + ((i * 3 + j) % 4) * 0.06,
        });
      }
    }
    return items;
  }, [cleaned]);

  return (
    <group scale={scale}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={cleaned ? "#62a85c" : highlight ? "#4f7a40" : "#355f2c"}
          roughness={0.92}
        />
      </mesh>
      {tufts.map((t, i) => (
        <GrassTuft
          key={i}
          position={t.p}
          height={t.h}
          color={
            cleaned
              ? "#6db866"
              : highlight
                ? "#5a9a4a"
                : i % 2 === 0
                  ? "#2f5c2c"
                  : "#3d6b3a"
          }
        />
      ))}
    </group>
  );
}

function LawnEdgeVisual({
  cleaned,
  highlight,
  scale,
}: {
  cleaned: boolean;
  highlight: boolean;
  scale: [number, number, number];
}) {
  return (
    <group scale={scale}>
      {!cleaned ? (
        <>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <mesh
              key={i}
              position={[0, 0.12 + (i % 2) * 0.06, t - 0.5]}
              rotation={[0.2, 0, (i - 2) * 0.15]}
              castShadow
            >
              <boxGeometry args={[0.35, 0.2, 0.22]} />
              <meshStandardMaterial
                color={highlight ? "#c4a35a" : "#7a5c2e"}
                roughness={0.9}
              />
            </mesh>
          ))}
        </>
      ) : (
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.22, 0.12, 1]} />
          <meshStandardMaterial color="#6aad64" roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

function WeedVisual({
  cleaned,
  highlight,
  tall,
}: {
  cleaned: boolean;
  highlight: boolean;
  tall: boolean;
}) {
  if (cleaned) {
    return (
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.08, 10]} />
        <meshStandardMaterial color="#5d9458" />
      </mesh>
    );
  }

  const blades = tall ? 7 : 5;
  return (
    <group>
      {Array.from({ length: blades }).map((_, i) => {
        const a = (i / blades) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.15, tall ? 0.4 : 0.28, Math.sin(a) * 0.15]}
            rotation={[0.15, a, 0.1]}
            castShadow
          >
            <coneGeometry args={[0.12, tall ? 0.9 : 0.6, 5]} />
            <meshStandardMaterial
              color={highlight ? "#5a9a4a" : i % 2 ? "#2f5c2c" : "#3d6b3a"}
              roughness={0.95}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function LeavesVisual({
  cleaned,
  highlight,
}: {
  cleaned: boolean;
  highlight: boolean;
}) {
  if (cleaned) return null;
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow scale={[1.1, 0.45, 0.95]}>
        <sphereGeometry args={[0.55, 12, 8]} />
        <meshStandardMaterial
          color={highlight ? "#e0b96a" : "#c4a35a"}
          roughness={1}
        />
      </mesh>
      {[
        [0.35, 0.08, 0.2],
        [-0.3, 0.06, -0.15],
        [0.1, 0.1, -0.35],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[0.4, i, 0.2]}
          castShadow
        >
          <boxGeometry args={[0.28, 0.04, 0.18]} />
          <meshStandardMaterial color={i % 2 ? "#b8843c" : "#d4a85c"} />
        </mesh>
      ))}
    </group>
  );
}

function HedgeVisual({
  cleaned,
  highlight,
  scale,
}: {
  cleaned: boolean;
  highlight: boolean;
  scale: [number, number, number];
}) {
  return (
    <group scale={scale}>
      <mesh
        position={[0, cleaned ? 0.45 : 0.6, 0]}
        castShadow
        scale={cleaned ? [1, 0.7, 0.85] : highlight ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        {cleaned ? (
          <boxGeometry args={[1.3, 1.1, 0.85]} />
        ) : (
          <dodecahedronGeometry args={[0.75, 0]} />
        )}
        <meshStandardMaterial
          color={cleaned ? "#3f7a3a" : highlight ? "#4a8a44" : "#2a5228"}
          flatShading={!cleaned}
          roughness={0.88}
        />
      </mesh>
    </group>
  );
}

function BranchVisual({
  cleaned,
  highlight,
}: {
  cleaned: boolean;
  highlight: boolean;
}) {
  if (cleaned) return null;
  const color = highlight ? "#8a6548" : "#5c4030";
  return (
    <group rotation={[0.1, 0.35, 0.05]}>
      <mesh position={[0, 0.12, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.14, 1.6, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh
        position={[0.35, 0.28, 0.15]}
        castShadow
        rotation={[0.4, 0.2, 0.8]}
      >
        <cylinderGeometry args={[0.05, 0.08, 0.7, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={[-0.4, 0.22, -0.1]}
        castShadow
        rotation={[-0.3, -0.1, -0.6]}
      >
        <cylinderGeometry args={[0.04, 0.07, 0.55, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function TargetVisual({
  targetKind,
  cleaned,
  highlight,
  scale,
}: {
  targetKind: TargetKind;
  cleaned: boolean;
  highlight: boolean;
  scale: [number, number, number];
}) {
  switch (targetKind) {
    case "long_lawn":
      return (
        <LongLawnVisual cleaned={cleaned} highlight={highlight} scale={scale} />
      );
    case "lawn_edge":
      return (
        <LawnEdgeVisual cleaned={cleaned} highlight={highlight} scale={scale} />
      );
    case "weeds":
      return (
        <group scale={scale}>
          <WeedVisual cleaned={cleaned} highlight={highlight} tall={false} />
        </group>
      );
    case "tall_edge_grass":
      return (
        <group scale={scale}>
          <WeedVisual cleaned={cleaned} highlight={highlight} tall />
        </group>
      );
    case "leaves":
      return (
        <group scale={scale}>
          <LeavesVisual cleaned={cleaned} highlight={highlight} />
        </group>
      );
    case "hedge":
      return (
        <HedgeVisual cleaned={cleaned} highlight={highlight} scale={scale} />
      );
    case "fallen_branch":
      return (
        <group scale={scale}>
          <BranchVisual cleaned={cleaned} highlight={highlight} />
        </group>
      );
    default:
      return null;
  }
}

export function DecorTree({ scale }: { scale: [number, number, number] }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 2.1, 8]} />
        <meshStandardMaterial color="#5c4030" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.15, 14, 14]} />
        <meshStandardMaterial color="#2d5a28" roughness={0.85} />
      </mesh>
      <mesh position={[0.55, 2.2, 0.3]} castShadow>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#356b30" />
      </mesh>
    </group>
  );
}

export function DecorBush({ scale }: { scale: [number, number, number] }) {
  return (
    <mesh castShadow scale={scale}>
      <icosahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial color="#2f5c2c" flatShading roughness={0.9} />
    </mesh>
  );
}

export function DecorPath({ scale }: { scale: [number, number, number] }) {
  return (
    <group scale={scale}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#a39e93" roughness={0.98} />
      </mesh>
      {[-0.35, 0, 0.35].map((z, i) => (
        <mesh key={i} position={[0, 0.52, z]} receiveShadow>
          <boxGeometry args={[0.85, 0.04, 0.28]} />
          <meshStandardMaterial color={i % 2 ? "#8f8a80" : "#9c978c"} />
        </mesh>
      ))}
    </group>
  );
}

export function DecorPlanter({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.5, 10]} />
        <meshStandardMaterial color="#8b5a3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshStandardMaterial color="#3a6b34" />
      </mesh>
    </group>
  );
}
