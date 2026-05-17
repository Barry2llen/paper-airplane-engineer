'use client';

import type { SceneTheme } from '@/lib/scenes';

export function Floor({ theme }: { theme: SceneTheme }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={theme.floor} roughness={0.85} />
      </mesh>
      
      <gridHelper key={`${theme.id}-minor-grid`} args={[80, 80, theme.gridMajor, theme.gridMinor]} position={[0, 0.005, 0]} />
      <gridHelper key={`${theme.id}-major-grid`} args={[80, 8, theme.gridAccent, theme.gridMajor]} position={[0, 0.01, 0]} />
    </>
  );
}
