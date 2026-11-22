"use client";

import { useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { getAsset } from "./assets";

function ProceduralGround() {
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
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-2, 0.01, 1]}
        receiveShadow
      >
        <circleGeometry args={[3.5, 24]} />
        <meshStandardMaterial color="#5d9458" roughness={0.95} />
      </mesh>
    </group>
  );
}

function TexturedGround({
  colorUrl,
  normalUrl,
  roughnessUrl,
}: {
  colorUrl: string;
  normalUrl: string;
  roughnessUrl: string;
}) {
  const [maps, setMaps] = useState<{
    map: THREE.Texture;
    normalMap: THREE.Texture;
    roughnessMap: THREE.Texture;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    Promise.all([
      loader.loadAsync(colorUrl),
      loader.loadAsync(normalUrl),
      loader.loadAsync(roughnessUrl),
    ])
      .then(([map, normalMap, roughnessMap]) => {
        if (cancelled) return;
        for (const tex of [map, normalMap, roughnessMap]) {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(10, 8);
          tex.colorSpace =
            tex === map ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          tex.anisotropy = 4;
        }
        setMaps({ map, normalMap, roughnessMap });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [colorUrl, normalUrl, roughnessUrl]);

  if (failed || !maps) {
    return <ProceduralGround />;
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#5c4636" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial
          map={maps.map}
          normalMap={maps.normalMap}
          roughnessMap={maps.roughnessMap}
          roughness={1}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

export function Ground() {
  const entry = getAsset("ground_grass");
  if (entry.kind === "texture" && entry.path) {
    return (
      <TexturedGround
        colorUrl="/assets/textures/grass/color.jpg"
        normalUrl="/assets/textures/grass/normal.jpg"
        roughnessUrl="/assets/textures/grass/roughness.jpg"
      />
    );
  }
  return <ProceduralGround />;
}
