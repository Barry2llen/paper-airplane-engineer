'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PaperPlane } from './PaperPlane';
import { Floor } from './Floor';
import { useStore } from '@/hooks/useStore';
import { EGGDROP_TARGET_DISTANCE } from '@/lib/physics';

function EggdropTarget() {
  const mission = useStore((state) => state.mission);

  if (mission !== 'eggdrop') return null;

  return (
    <group position={[0, 0.05, EGGDROP_TARGET_DISTANCE]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.2, 0.035, 12, 72]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.45} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.45, 0.025, 12, 48]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [-5, 3, 5], fov: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      className="outline-none"
    >
      <color attach="background" args={['#0F1115']} />
      <fog attach="fog" args={['#0F1115', 18, 55]} />
      
      <ambientLight intensity={0.65} color="#c7d2fe" />
      <hemisphereLight args={['#e0f2fe', '#0f172a', 1.1]} />
      <directionalLight 
        position={[8, 14, 8]} 
        castShadow 
        intensity={2} 
        color="#ffffff"
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-4, 4, -4]} intensity={0.8} color="#3B82F6" />
      
      <Floor />
      <EggdropTarget />
      <PaperPlane />
      
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        enablePan={true}
        enableZoom={true}
        maxDistance={20}
      />
    </Canvas>
  );
}
