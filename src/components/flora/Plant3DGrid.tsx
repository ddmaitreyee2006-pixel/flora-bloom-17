import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useFlora } from "@/lib/store";

function PlantOrb({ position, health, name }: { position: [number, number, number]; health: number; name: string }) {
  const ref = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime + position[0]) * 0.06;
    }
    if (orbRef.current) {
      orbRef.current.position.y = 1.4 + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.08;
    }
  });
  const c = health > 75 ? "#39ff85" : health > 50 ? "#ffaa00" : "#ff3b3b";
  const scale = 0.4 + (health / 100) * 0.6;
  return (
    <group position={position}>
      <group ref={ref}>
        <mesh position={[0, scale / 2, 0]} scale={[scale * 0.5, scale, scale * 0.5]}>
          <coneGeometry args={[1, 1.6, 6]} />
          <meshStandardMaterial color="#1a5c2a" emissive={c} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]} scale={[0.4, 0.1, 0.4]}>
          <cylinderGeometry args={[1, 1.1, 1, 12]} />
          <meshStandardMaterial color="#0a2e14" />
        </mesh>
      </group>
      <mesh ref={orbRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={c} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color={c} intensity={0.6} distance={3} />
    </group>
  );
}

export function Plant3DGrid() {
  const plants = useFlora((s) => s.plants);
  return (
    <Canvas
      camera={{ position: [0, 4, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <fog attach="fog" args={["#010a04", 8, 18]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={0.7} color="#39ff85" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[5, 48]} />
        <meshStandardMaterial color="#021208" emissive="#0a2e14" emissiveIntensity={0.4} />
      </mesh>
      {plants.map((p, i) => {
        const angle = (i / plants.length) * Math.PI * 2;
        const r = 3;
        return (
          <PlantOrb
            key={p.id}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            health={p.health}
            name={p.name}
          />
        );
      })}
    </Canvas>
  );
}
