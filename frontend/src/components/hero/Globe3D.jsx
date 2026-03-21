import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Pulsing hotspot marker on globe
function HotSpot({ position, color = '#ef4444', scale = 1 }) {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale * (1 + 0.3 * Math.sin(t * 2)));
      meshRef.current.material.opacity = 0.6 + 0.4 * Math.sin(t * 2);
    }
    if (innerRef.current) {
      innerRef.current.material.opacity = 0.9 + 0.1 * Math.sin(t * 3 + 1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.018 * scale, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.035 * scale, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Convert lat/lng to 3D position on unit sphere
function latLngToVec3(lat, lng, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeScene({ mouseX, mouseY }) {
  const globeRef = useRef();
  const gridRef = useRef();

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.08 + mouseX * 0.3;
      globeRef.current.rotation.x = mouseY * 0.15;
    }
    if (gridRef.current) {
      gridRef.current.rotation.y = clock.getElapsedTime() * 0.08 + mouseX * 0.3;
      gridRef.current.rotation.x = mouseY * 0.15;
    }
  });

  // Wireframe lines
  const linesMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: '#10b981',
    transparent: true,
    opacity: 0.12,
  }), []);

  const gridGeometry = useMemo(() => {
    const geo = new THREE.EdgesGeometry(new THREE.SphereGeometry(1.001, 20, 15));
    return geo;
  }, []);

  // Jaipur and surrounding hazard zone positions
  const jaipurPos = latLngToVec3(26.9124, 75.7873);
  const hotspots = [
    { pos: latLngToVec3(26.86, 75.75), color: '#ef4444', scale: 1.3 },
    { pos: latLngToVec3(26.83, 75.76), color: '#ef4444', scale: 1.1 },
    { pos: latLngToVec3(26.92, 75.79), color: '#f59e0b', scale: 0.9 },
    { pos: latLngToVec3(26.93, 75.82), color: '#f59e0b', scale: 0.8 },
    { pos: latLngToVec3(26.80, 75.80), color: '#ef4444', scale: 1.2 },
    { pos: latLngToVec3(26.82, 75.84), color: '#f97316', scale: 0.85 },
    { pos: latLngToVec3(26.86, 75.81), color: '#f59e0b', scale: 0.75 },
  ];

  return (
    <>
      <ambientLight intensity={0.3} color="#0a1628" />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#10b981" />
      <directionalLight position={[-5, -3, -2]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#ffffff" />

      {/* Globe base */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#040812"
          emissive="#0a1628"
          emissiveIntensity={0.3}
          shininess={20}
          transparent
          opacity={0.95}
        />

        {/* Hotspots on globe */}
        {hotspots.map((h, i) => (
          <HotSpot key={i} position={h.pos} color={h.color} scale={h.scale} />
        ))}

        {/* Jaipur marker - bright green */}
        <HotSpot position={jaipurPos} color="#10b981" scale={1.6} />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments ref={gridRef} geometry={gridGeometry} material={linesMaterial} />

      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Atmosphere halo */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

export default function Globe3D({ mouseX = 0, mouseY = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <GlobeScene mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
