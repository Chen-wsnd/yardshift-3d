"use client";

import { DecorPlanter } from "./visuals/TargetVisuals";

/**
 * Permanent non-objective props for the clean base yard.
 * Kept out of job layouts so dirty layers stay independently addressable.
 */
export function BaseDecor() {
  return (
    <group>
      <DecorPlanter position={[-8.2, 0, -6.2]} />
      <DecorPlanter position={[8.2, 0, -6.2]} />
      <DecorPlanter position={[-8.2, 0, 6.2]} />
      {/* Corner stepping stones near path start */}
      <mesh position={[0, 0.03, 6.5]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 8]} />
        <meshStandardMaterial color="#9a958c" roughness={0.95} />
      </mesh>
      <mesh position={[0.7, 0.03, 6.9]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 8]} />
        <meshStandardMaterial color="#8f8a80" roughness={0.95} />
      </mesh>
    </group>
  );
}
