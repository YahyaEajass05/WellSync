'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface WellnessOrbProps {
  score: number; // 0-100
}

export function WellnessOrb({ score }: WellnessOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Determine color based on wellness score
  const getColor = () => {
    if (score >= 70) return '#4ade80'; // Green - Good
    if (score >= 40) return '#fbbf24'; // Yellow - Fair
    return '#ef4444'; // Red - Poor
  };

  // Animate the orb
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y += 0.01;
      
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <meshStandardMaterial
        color={getColor()}
        roughness={0.2}
        metalness={0.8}
        emissive={getColor()}
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}
