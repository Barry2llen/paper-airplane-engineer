'use client';

import * as THREE from 'three';
import type { SceneId } from '@/lib/scenes';

function LabScenery() {
  return (
    <group>
      <mesh position={[0, 4.8, 38]}>
        <planeGeometry args={[38, 9]} />
        <meshStandardMaterial color="#DBEAFE" transparent opacity={0.28} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 4.6, 34.5]}>
        <torusGeometry args={[4.1, 0.08, 16, 96]} />
        <meshStandardMaterial color="#60A5FA" emissive="#2563EB" emissiveIntensity={0.18} roughness={0.35} />
      </mesh>
      <mesh position={[0, 4.6, 34.5]}>
        <torusGeometry args={[2.35, 0.045, 12, 72]} />
        <meshStandardMaterial color="#BFDBFE" emissive="#3B82F6" emissiveIntensity={0.12} roughness={0.35} />
      </mesh>

      {[-17, -11, 11, 17].map((x) => (
        <group key={x} position={[x, 0, 37.5]}>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.5, 4.4, 0.5]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 4.7, 0]}>
            <boxGeometry args={[1.2, 0.25, 0.8]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.48} />
          </mesh>
        </group>
      ))}

      {[-14, -8, 8, 14].map((x) => (
        <mesh key={x} position={[x, 3.1, 33.8]} rotation={[0, x > 0 ? -0.18 : 0.18, 0]}>
          <boxGeometry args={[3.2, 2.2, 0.18]} />
          <meshStandardMaterial color="#E0F2FE" emissive="#38BDF8" emissiveIntensity={0.1} roughness={0.42} />
        </mesh>
      ))}

      {[-16, -8, 0, 8, 16].map((x) => (
        <mesh key={x} position={[x, 0.08, 32.2]}>
          <boxGeometry args={[3, 0.08, 1]} />
          <meshStandardMaterial color="#BFDBFE" emissive="#2563EB" emissiveIntensity={0.06} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function FieldScenery() {
  const treePositions = [-38, -34, -30, -26, -21, -16, -11, -6, -1, 5, 10, 15, 20, 25, 30, 35, 39];
  const cloudClusters = [
    { position: [-18, 8.4, 41] as const, scale: 1 },
    { position: [12, 9.2, 38] as const, scale: 0.78 },
    { position: [30, 7.7, 44] as const, scale: 0.58 },
  ];

  return (
    <group>
      <mesh position={[-20, 0.75, 34]}>
        <boxGeometry args={[11, 1.5, 1.4]} />
        <meshStandardMaterial color="#C7D2FE" roughness={0.8} />
      </mesh>
      <mesh position={[-20, 1.65, 34]}>
        <boxGeometry args={[11.8, 0.25, 1.8]} />
        <meshStandardMaterial color="#E0E7FF" roughness={0.75} />
      </mesh>

      <mesh position={[18, 0.65, 35]}>
        <boxGeometry args={[12, 1.3, 1.4]} />
        <meshStandardMaterial color="#BAE6FD" roughness={0.78} />
      </mesh>
      <mesh position={[18, 1.45, 35]}>
        <boxGeometry args={[12.8, 0.24, 1.8]} />
        <meshStandardMaterial color="#E0F2FE" roughness={0.72} />
      </mesh>

      {treePositions.map((x, index) => (
        <group key={x} position={[x, 0, 39 + (index % 4) * 1.1]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.4, 8]} />
            <meshStandardMaterial color="#8B5E34" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.75, 0]} scale={[1.15, 0.95, 1.15]}>
            <sphereGeometry args={[0.8, 12, 8]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#4ADE80' : '#22C55E'} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {cloudClusters.map((cloud, index) => (
        <group key={index} position={cloud.position} scale={cloud.scale}>
          <mesh scale={[2.2, 0.42, 0.45]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.68} />
          </mesh>
          <mesh position={[1.6, 0.12, 0]} scale={[1.45, 0.35, 0.38]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.62} />
          </mesh>
          <mesh position={[-1.5, 0.04, 0]} scale={[1.25, 0.32, 0.34]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.58} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SunsetScenery() {
  const towerHeights = [2.4, 3.6, 2.9, 4.5, 3.2, 2.1, 3.9, 2.7, 4.1, 2.5, 3.4, 2.8, 4.4];
  const runwayLightZ = [28, 31, 34, 37, 40, 43, 46];

  return (
    <group>
      <mesh position={[17, 7.2, 43]}>
        <circleGeometry args={[3.2, 48]} />
        <meshBasicMaterial color="#FDBA74" transparent opacity={0.78} side={THREE.DoubleSide} />
      </mesh>

      <group position={[-25, 0, 43]}>
        {towerHeights.map((height, index) => (
          <mesh key={index} position={[index * 3.8, height / 2, 0]}>
            <boxGeometry args={[2.4, height, 1.2]} />
            <meshBasicMaterial color={index % 2 === 0 ? '#4A2D22' : '#5B3425'} />
          </mesh>
        ))}
      </group>

      <mesh position={[-27, 1.05, 38]}>
        <boxGeometry args={[6.5, 2.1, 2]} />
        <meshBasicMaterial color="#6B3A25" />
      </mesh>
      <mesh position={[-27, 2.35, 38]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[4.6, 0.35, 2.1]} />
        <meshBasicMaterial color="#7C4A24" />
      </mesh>

      {runwayLightZ.map((z) => (
        <group key={z}>
          <mesh position={[-5.6, 0.18, z]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <meshStandardMaterial color="#FDE68A" emissive="#F59E0B" emissiveIntensity={0.75} roughness={0.25} />
          </mesh>
          <mesh position={[-3.2, 0.18, z]}>
            <sphereGeometry args={[0.13, 12, 8]} />
            <meshStandardMaterial color="#FDE68A" emissive="#F59E0B" emissiveIntensity={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[3.2, 0.18, z]}>
            <sphereGeometry args={[0.13, 12, 8]} />
            <meshStandardMaterial color="#FDE68A" emissive="#F59E0B" emissiveIntensity={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[5.6, 0.18, z]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <meshStandardMaterial color="#FDE68A" emissive="#F59E0B" emissiveIntensity={0.75} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function DistantScenery({ sceneId }: { sceneId: SceneId }) {
  if (sceneId === 'field') return <FieldScenery />;
  if (sceneId === 'sunset') return <SunsetScenery />;
  return <LabScenery />;
}
