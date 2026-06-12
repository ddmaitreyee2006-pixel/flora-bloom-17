import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Terrain() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 60, 80, 80);
    return g;
  }, []);
  useFrame(({ clock }) => {
    const pos = geo.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 0.3 + t * 0.5) * 0.6 +
        Math.cos(y * 0.4 + t * 0.3) * 0.5 +
        Math.sin((x + y) * 0.2 + t) * 0.3;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    if (ref.current) ref.current.rotation.z = t * 0.02;
  });
  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -3, 0]}>
      <meshStandardMaterial
        color="#0a2e14"
        emissive="#1a5c2a"
        emissiveIntensity={0.4}
        wireframe
      />
    </mesh>
  );
}

function Spores({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 12 - 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds[i] * delta;
      if (y > 8) y = -4;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#39ff85"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CenterPlant() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.2;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.15;
    }
  });
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#1a5c2a"
          emissive="#39ff85"
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial emissive="#39ff85" emissiveIntensity={2} color="#39ff85" />
      </mesh>
    </group>
  );
}

export function GenesisScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <fog attach="fog" args={["#010a04", 6, 22]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 4]} color="#39ff85" intensity={2} distance={20} />
      <pointLight position={[-6, -2, -4]} color="#00ffe0" intensity={1} distance={15} />
      <Terrain />
      <CenterPlant />
      <Spores />
    </Canvas>
  );
}
