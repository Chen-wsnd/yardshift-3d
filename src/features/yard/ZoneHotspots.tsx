"use client";

import { useState } from "react";
import { Text } from "@react-three/drei";
import { useGameStore } from "@/game/store/gameStore";

export function ZoneHotspots() {
  const jobId = useGameStore((s) => s.work.activeJobId);
  const job = useGameStore((s) =>
    jobId ? s.work.jobs[jobId] : null,
  );
  const focusZone = useGameStore((s) => s.focusZone);
  const [hover, setHover] = useState<string | null>(null);

  if (!job) {
    return (
      <Text position={[0, 1.5, 0]} fontSize={0.45} color="#334" anchorX="center">
        Accept a job from the Task Board
      </Text>
    );
  }

  return (
    <group>
      {job.zones.map((z) => {
        const cx = z.bounds.x + z.bounds.width / 2;
        const cz = z.bounds.z + z.bounds.depth / 2;
        const active = hover === z.id;
        return (
          <group key={z.id} position={[cx, 0.05, cz]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHover(z.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHover(null);
                document.body.style.cursor = "auto";
              }}
              onClick={(e) => {
                e.stopPropagation();
                focusZone(z.id);
              }}
            >
              <planeGeometry args={[z.bounds.width, z.bounds.depth]} />
              <meshStandardMaterial
                color={active ? "#f59e0b" : "#84cc16"}
                transparent
                opacity={active ? 0.35 : 0.18}
                depthWrite={false}
              />
            </mesh>
            {active ? (
              <Text
                position={[0, 0.8, 0]}
                fontSize={0.35}
                color="#1c1917"
                anchorX="center"
                outlineWidth={0.01}
                outlineColor="#fff"
              >
                {z.name}
              </Text>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
