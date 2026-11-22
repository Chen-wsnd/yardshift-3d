"use client";

import { useState } from "react";
import { DoubleSide } from "three";
import { useTapInteraction } from "./useTapInteraction";

interface ClickProxyProps {
  position: [number, number, number];
  size?: [number, number, number];
  enabled: boolean;
  onInteract: () => void;
  onHoverChange?: (hovered: boolean) => void;
  showHoverRing?: boolean;
}

/**
 * Stable invisible hitbox for reliable pointer picking.
 * Visual meshes remain decorative / transition-only.
 */
export function ClickProxy({
  position,
  size = [1.6, 1.2, 1.6],
  enabled,
  onInteract,
  onHoverChange,
  showHoverRing = true,
}: ClickProxyProps) {
  const [hovered, setHovered] = useState(false);
  const handlers = useTapInteraction(onInteract, enabled);

  const setHover = (value: boolean) => {
    setHovered(value);
    onHoverChange?.(value);
  };

  return (
    <group position={position}>
      {/* Must stay visible=true so Three.js raycasting can hit the proxy.
          Opacity 0 keeps it invisible without disabling picks. */}
      <mesh
        onPointerOver={(e) => {
          handlers.onPointerOver(e);
          if (enabled) setHover(true);
        }}
        onPointerOut={() => {
          handlers.onPointerOut();
          setHover(false);
        }}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
      >
        <boxGeometry args={size} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {showHoverRing && hovered && enabled ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.55, 0.72, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
        </mesh>
      ) : null}
    </group>
  );
}
