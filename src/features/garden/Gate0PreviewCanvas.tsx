"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { Object3D } from "three";
import {
  GARDEN_HIDE_NAME_MATCHES,
  GARDEN_SCENE,
  OVERVIEW_CAMERA,
} from "@/data/gardenScene";

function RawOrAdapted({ adapted }: { adapted: boolean }) {
  const { scene } = useGLTF(GARDEN_SCENE.localPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((obj: Object3D) => {
      if (!adapted) {
        obj.visible = true;
        return;
      }
      const lower = (obj.name || "").toLowerCase();
      if (GARDEN_HIDE_NAME_MATCHES.some((m) => lower.includes(m))) {
        obj.visible = false;
      } else {
        obj.visible = true;
      }
    });
  }, [cloned, adapted]);

  return <primitive object={cloned} />;
}

export function Gate0PreviewCanvas() {
  const [adapted, setAdapted] = useState(true);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: OVERVIEW_CAMERA.position,
          fov: OVERVIEW_CAMERA.fov,
        }}
      >
        <color attach="background" args={["#9ec5e8"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[12, 18, 8]} intensity={1.1} />
        <Suspense fallback={null}>
          <RawOrAdapted adapted={adapted} />
        </Suspense>
        <OrbitControls target={OVERVIEW_CAMERA.target} />
      </Canvas>
      <div className="absolute bottom-3 left-3 rounded bg-black/60 px-3 py-2 text-xs text-white">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={adapted}
            onChange={(e) => setAdapted(e.target.checked)}
          />
          Apply Gate 0 hide list (characters / baked lawn / mid-job mowers)
        </label>
      </div>
    </div>
  );
}

useGLTF.preload(GARDEN_SCENE.localPath);
