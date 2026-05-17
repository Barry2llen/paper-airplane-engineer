'use client';

export function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.85} />
      </mesh>
      
      <gridHelper args={[80, 80, '#CBD5E1', '#E2E8F0']} position={[0, 0.005, 0]} />
      <gridHelper args={[80, 8, '#2563EB', '#CBD5E1']} position={[0, 0.01, 0]} />
    </>
  );
}
