'use client';

export function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0A0B0D" roughness={0.8} />
      </mesh>
      
      <gridHelper args={[80, 80, '#2D3139', '#1F2229']} position={[0, 0.005, 0]} />
      <gridHelper args={[80, 8, '#3B82F6', '#2D3139']} position={[0, 0.01, 0]} />
    </>
  );
}
