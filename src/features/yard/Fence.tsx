"use client";

function FencePost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.16, 1.25, 0.16]} />
        <meshStandardMaterial color="#6b5344" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.22, 0.08, 0.22]} />
        <meshStandardMaterial color="#5a4538" />
      </mesh>
    </group>
  );
}

function FenceRail({
  position,
  rotation = [0, 0, 0] as [number, number, number],
  length,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[length, 0.12, 0.07]} />
      <meshStandardMaterial color="#8a6f5a" roughness={0.9} />
    </mesh>
  );
}

/** Rectangular wood fence around the 20×16 yard (x±10, z±8). */
export function Fence() {
  const halfW = 10;
  const halfD = 8;
  const posts: [number, number, number][] = [];

  for (let x = -halfW; x <= halfW; x += 2) {
    posts.push([x, 0.62, -halfD]);
    posts.push([x, 0.62, halfD]);
  }
  for (let z = -halfD + 2; z < halfD; z += 2) {
    posts.push([-halfW, 0.62, z]);
    posts.push([halfW, 0.62, z]);
  }

  return (
    <group>
      {posts.map((pos, i) => (
        <FencePost key={`post-${i}`} position={pos} />
      ))}
      <FenceRail position={[0, 0.9, -halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.42, -halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.9, halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.42, halfD]} length={halfW * 2} />
      <FenceRail
        position={[-halfW, 0.9, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[-halfW, 0.42, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[halfW, 0.9, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[halfW, 0.42, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
    </group>
  );
}
