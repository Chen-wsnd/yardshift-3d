"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";

type MowerKind = "manual-reel-mower" | "lawn-mower";

function AnimatedMowerModel({
  kind,
  position,
  yaw,
  moving,
  cutting,
}: {
  kind: MowerKind;
  position: [number, number, number];
  yaw: number;
  moving: boolean;
  cutting: boolean;
}) {
  const path =
    kind === "manual-reel-mower"
      ? MODEL_CATALOG.manual_reel_mower.localPath
      : MODEL_CATALOG.mower.localPath;
  const { scene, animations } = useGLTF(path);
  const root = useRef<Group>(null);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const { actions } = useAnimations(animations, root);

  useEffect(() => {
    const wheel = actions["wheel-roll"];
    const blade = actions["blade-spin"];
    if (moving) {
      wheel?.reset().fadeIn(0.08).play();
    } else {
      wheel?.fadeOut(0.1);
      wheel?.stop();
    }
    // Reel: blade only while advancing; powered: while actively cutting
    const bladeOn =
      kind === "manual-reel-mower" ? moving && cutting : cutting;
    if (bladeOn) {
      blade?.reset().fadeIn(0.05).play();
    } else {
      blade?.fadeOut(0.1);
      blade?.stop();
    }
    return () => {
      wheel?.stop();
      blade?.stop();
    };
  }, [actions, moving, cutting, kind]);

  useFrame(() => {
    if (root.current) {
      root.current.position.set(position[0], position[1], position[2]);
      root.current.rotation.y = yaw;
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, yaw, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

function FallbackMower({
  kind,
  position,
  yaw,
}: {
  kind: MowerKind;
  position: [number, number, number];
  yaw: number;
}) {
  const powered = kind === "lawn-mower";
  return (
    <mesh position={position} rotation={[0, yaw, 0]}>
      <boxGeometry args={[powered ? 0.7 : 0.55, 0.4, powered ? 1.0 : 0.85]} />
      <meshStandardMaterial color={powered ? "#2a6db0" : "#8a5a3a"} />
    </mesh>
  );
}

/**
 * Distinct GLBs for reel vs powered — natural scale (no fake resize).
 * Animations play only when moving / actively cutting.
 */
export function MowerTool({
  kind,
  position,
  direction,
  moving,
  cutting,
}: {
  kind: MowerKind;
  position: [number, number, number];
  direction: [number, number];
  moving: boolean;
  cutting: boolean;
}) {
  // Models face +Z; yaw from motion vector in XZ
  const yaw = Math.atan2(direction[0], direction[1]);

  return (
    <Suspense
      fallback={<FallbackMower kind={kind} position={position} yaw={yaw} />}
    >
      <AnimatedMowerModel
        kind={kind}
        position={position}
        yaw={yaw}
        moving={moving}
        cutting={cutting}
      />
    </Suspense>
  );
}

useGLTF.preload(MODEL_CATALOG.mower.localPath);
useGLTF.preload(MODEL_CATALOG.manual_reel_mower.localPath);

export function mowerCatalogPath(toolId: string | null): string | null {
  if (toolId === "manual-reel-mower") {
    return MODEL_CATALOG.manual_reel_mower.localPath;
  }
  if (toolId === "lawn-mower") return MODEL_CATALOG.mower.localPath;
  return null;
}
