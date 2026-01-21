'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { WellnessOrb } from './WellnessOrb';
import { Suspense } from 'react';

interface SceneProps {
  score: number;
}

export function Scene({ score }: SceneProps) {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Canvas>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />

          {/* Lights */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Wellness Orb */}
          <WellnessOrb score={score} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
