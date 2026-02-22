'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

// Theme-aware brain neuron node with enhanced pulsing
function BrainNeuron({ 
  position, 
  isDark 
}: { 
  position: [number, number, number];
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial
        color={isDark ? "#a78bfa" : "#7c3aed"}
        emissive={isDark ? "#8b5cf6" : "#6d28d9"}
        emissiveIntensity={isDark ? 0.5 : 0.7}
        metalness={0.5}
        roughness={0.3}
      />
    </Sphere>
  );
}

// Neural connection lines with signal waves
function NeuralConnections({ isDark }: { isDark: boolean }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const neuronPositions = [
      [0, 0, 0], [-2, 1, -1], [2, 1, -1], [-1, -2, 0], [1, -2, 0],
      [-2, -1, 1], [2, -1, 1], [0, 2, -0.5], [-1.5, 0, -2], [1.5, 0, -2],
      [0, -1, 2], [-2.5, 0.5, 0], [2.5, 0.5, 0]
    ];

    const connections: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < neuronPositions.length; i++) {
      for (let j = i + 1; j < neuronPositions.length; j++) {
        const dist = Math.sqrt(
          Math.pow(neuronPositions[i][0] - neuronPositions[j][0], 2) +
          Math.pow(neuronPositions[i][1] - neuronPositions[j][1], 2) +
          Math.pow(neuronPositions[i][2] - neuronPositions[j][2], 2)
        );

        if (dist < 3) {
          connections.push(...neuronPositions[i], ...neuronPositions[j]);
          if (isDark) {
            colors.push(0.54, 0.55, 0.97, 0.23, 0.51, 0.96);
          } else {
            colors.push(0.49, 0.22, 0.93, 0.42, 0.16, 0.85);
          }
        }
      }
    }

    return {
      positions: new Float32Array(connections),
      colors: new Float32Array(colors)
    };
  }, [isDark]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={isDark ? 0.4 : 0.6}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Signal waves traveling through neural connections
function SignalWaves({ isDark }: { isDark: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 3 + 1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry;
      const positionAttribute = geometry.attributes.position;
      
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        const time = state.clock.elapsedTime;
        const wave = Math.sin(time * 2 + i * 0.5) * 0.02;
        
        positionAttribute.setXYZ(
          i,
          x + wave * Math.cos(time + i),
          y + wave * Math.sin(time + i),
          z + wave
        );
      }
      
      positionAttribute.needsUpdate = true;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={isDark ? "#60a5fa" : "#3b82f6"}
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Central brain sphere
function CentralBrainSphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial
        color={isDark ? "#6366f1" : "#4f46e5"}
        emissive={isDark ? "#4f46e5" : "#3730a3"}
        emissiveIntensity={isDark ? 0.4 : 0.6}
        metalness={0.7}
        roughness={0.3}
        wireframe
      />
    </Sphere>
  );
}

// Synaptic particles
function SynapticParticles({ isDark }: { isDark: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = isDark ? [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#4f46e5'),
    ] : [
      new THREE.Color('#7c3aed'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#4f46e5'),
      new THREE.Color('#3730a3'),
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 8 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [isDark]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={isDark ? 0.6 : 0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function AuthBackgroundCanvas() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  const neuronPositions: [number, number, number][] = [
    [0, 0, 0],
    [-2, 1, -1], [2, 1, -1], [-1, -2, 0], [1, -2, 0], [-2, -1, 1], [2, -1, 1],
    [0, 3, -0.5], [-3, 0, -1], [3, 0, -1], [0, -3, 0],
    [-2.5, 2, 0], [2.5, 2, 0], [-2.5, -2, 0], [2.5, -2, 0],
    [-4, 1, -2], [4, 1, -2], [-3, -3, -1], [3, -3, -1],
    [0, 4, -1], [0, -4, 1], [-4, 0, 2], [4, 0, 2],
    [-1.5, 0, -4], [1.5, 0, 4]
  ];

  const backgroundGradient = isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)'
    : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)';

  return (
    <div className="fixed inset-0 -z-10 transition-all duration-500">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 70 }}
        style={{ background: backgroundGradient }}
      >
        <ambientLight intensity={isDark ? 0.4 : 0.6} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={isDark ? 0.6 : 0.8} 
          color={isDark ? "#ffffff" : "#fef3c7"} 
        />
        <pointLight 
          position={[0, 0, 0]} 
          intensity={isDark ? 1.2 : 1.5} 
          color={isDark ? "#8b5cf6" : "#7c3aed"} 
        />
        <pointLight 
          position={[-8, 8, -8]} 
          intensity={isDark ? 0.6 : 0.8} 
          color={isDark ? "#6366f1" : "#4f46e5"} 
        />
        <pointLight 
          position={[8, -8, 8]} 
          intensity={isDark ? 0.6 : 0.8} 
          color={isDark ? "#4f46e5" : "#3730a3"} 
        />
        
        <CentralBrainSphere isDark={isDark} />
        <NeuralConnections isDark={isDark} />
        <SignalWaves isDark={isDark} />
        
        {neuronPositions.map((pos, i) => (
          <BrainNeuron key={i} position={pos} isDark={isDark} />
        ))}
        
        <SynapticParticles isDark={isDark} />
        
        <Stars
          radius={150}
          depth={80}
          count={isDark ? 2000 : 1500}
          factor={3}
          saturation={isDark ? 0 : 0.2}
          fade
          speed={0.3}
        />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.15}
        />
      </Canvas>
      
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-black/40 via-black/30 to-black/50' 
            : 'bg-gradient-to-b from-white/20 via-white/10 to-white/30'
        }`} 
      />
      
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isDark 
            ? 'shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]' 
            : 'shadow-[inset_0_0_120px_rgba(0,0,0,0.15)]'
        }`} 
      />
    </div>
  );
}
