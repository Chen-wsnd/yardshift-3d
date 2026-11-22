"use client";

export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#5c4636" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#4a7c46" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.01, 1]} receiveShadow>
        <circleGeometry args={[3.5, 24]} />
        <meshStandardMaterial color="#5d9458" roughness={0.95} />
      </mesh>
    </group>
  );
}
