"use client";

function FencePost({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.15, 1.2, 0.15]} />
      <meshStandardMaterial color="#6b5344" />
    </mesh>
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
      <boxGeometry args={[length, 0.1, 0.08]} />
      <meshStandardMaterial color="#8a6f5a" />
    </mesh>
  );
}

/** Simple rectangular fence around the yard using primitive boxes. */
export function Fence() {
  const halfW = 10;
  const halfD = 8;
  const posts: [number, number, number][] = [];

  for (let x = -halfW; x <= halfW; x += 2) {
    posts.push([x, 0.6, -halfD]);
    posts.push([x, 0.6, halfD]);
  }
  for (let z = -halfD + 2; z < halfD; z += 2) {
    posts.push([-halfW, 0.6, z]);
    posts.push([halfW, 0.6, z]);
  }

  return (
    <group>
      {posts.map((pos, i) => (
        <FencePost key={`post-${i}`} position={pos} />
      ))}
      <FenceRail position={[0, 0.85, -halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.4, -halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.85, halfD]} length={halfW * 2} />
      <FenceRail position={[0, 0.4, halfD]} length={halfW * 2} />
      <FenceRail
        position={[-halfW, 0.85, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[-halfW, 0.4, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[halfW, 0.85, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
      <FenceRail
        position={[halfW, 0.4, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={halfD * 2}
      />
    </group>
  );
}
