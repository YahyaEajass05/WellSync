'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StressVisualizationProps {
  stressLevel: number; // 0-10
}

export function StressVisualization({ stressLevel }: StressVisualizationProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Create particles based on stress level
  const particles = useMemo(() => {
    const count = Math.floor(100 + stressLevel * 50); // More particles = more stress
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    return positions;
  }, [stressLevel]);

  // Get color based on stress level
  const getColor = () => {
    if (stressLevel <= 3) return '#4ade80'; // Low - Green
    if (stressLevel <= 6) return '#fbbf24'; // Moderate - Yellow
    if (stressLevel <= 8) return '#fb923c'; // High - Orange
    return '#ef4444'; // Very High - Red
  };

  // Animate particles
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Make particles more chaotic with higher stress
      const speed = 0.001 + (stressLevel / 10) * 0.005;
      particlesRef.current.rotation.x += speed;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05 + (stressLevel / 10) * 0.05}
        color={getColor()}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
