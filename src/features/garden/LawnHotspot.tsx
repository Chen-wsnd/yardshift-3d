"use client";

import { useState } from "react";
import { LAWN_HOTSPOT } from "@/data/gardenScene";

export function LawnHotspot({
  onSelect,
  disabled,
}: {
  onSelect: () => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={LAWN_HOTSPOT.center}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onSelect();
      }}
    >
      <boxGeometry args={LAWN_HOTSPOT.size} />
      <meshBasicMaterial
        color={hovered ? "#c8e6a0" : "#9ccc65"}
        transparent
        opacity={hovered ? 0.22 : 0.04}
        depthWrite={false}
      />
    </mesh>
  );
}
