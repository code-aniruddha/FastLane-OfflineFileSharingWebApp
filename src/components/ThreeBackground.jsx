import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function PulseCore() {
  const coreRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!coreRef.current) return;
    coreRef.current.rotation.x = Math.sin(t * 0.45) * 0.6;
    coreRef.current.rotation.y = t * 0.42;
  });

  return (
    <Float floatIntensity={1.4} rotationIntensity={0.6} speed={1.4}>
      <mesh ref={coreRef} scale={1.8} position={[0, 0.6, -6]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#E9C46A"
          emissive="#E76F51"
          emissiveIntensity={0.65}
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>
    </Float>
  );
}

function NeonOrbit() {
  const groupRef = useRef();
  const rings = useMemo(
    () => [
      { radius: 4.6, thickness: 0.08, color: '#E76F51', rotation: 0 },
      { radius: 5.4, thickness: 0.06, color: '#E9C46A', rotation: Math.PI / 4 },
      { radius: 6.1, thickness: 0.05, color: '#F8F9FA', rotation: Math.PI / 1.8 }
    ],
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.08;
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0.4, -6]}>
      {rings.map(({ radius, thickness, color, rotation }) => (
        <mesh key={`${radius}-${color}`} rotation={[Math.PI / 2, 0, rotation]}>
          <torusGeometry args={[radius, thickness, 64, 256]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef();
  const particles = useMemo(() => {
    const count = 4800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.05;
    pointsRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <points ref={pointsRef} position={[0, -1, -12]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#F8F9FA"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingNodes() {
  const groupRef = useRef();
  const nodes = useMemo(() => {
    const palette = ['#E76F51', '#E9C46A', '#F4A261'];
    return Array.from({ length: 26 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.1) * 10,
        -4 - Math.random() * 12
      ],
      scale: 0.18 + Math.random() * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.06;
  });

  return (
    <group ref={groupRef}>
      {nodes.map(({ position, scale, color }, index) => (
        <mesh key={index} position={position} scale={scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function DataGrid() {
  const gridRef = useRef();

  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current.material.transparent = true;
    gridRef.current.material.opacity = 0.08;
  }, []);

  useFrame((state) => {
    if (!gridRef.current) return;
    const t = state.clock.getElapsedTime();
    gridRef.current.position.y = -6 + Math.sin(t * 0.4) * 0.4;
  });

  return <gridHelper ref={gridRef} args={[120, 60, '#E76F51', '#282D33']} position={[0, -6, -10]} />;
}

export default function ThreeBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 12], fov: 70 }}
        style={{ background: 'radial-gradient(circle at 20% 20%, #282D33 0%, #14181d 65%, #090b0d 100%)' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 10, 4]} intensity={0.7} color="#E9C46A" />
        <directionalLight position={[-8, -6, -12]} intensity={0.4} color="#E76F51" />
        <pointLight position={[0, 6, 2]} intensity={1.2} color="#F4A261" distance={40} />

        <Sparkles count={120} scale={18} size={2.4} speed={0.35} color="#E76F51" />

        <PulseCore />
        <NeonOrbit />
        <ParticleField />
        <FloatingNodes />
        <DataGrid />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 2.8}
        />
      </Canvas>
    </div>
  );
}
