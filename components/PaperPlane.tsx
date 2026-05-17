'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/hooks/useStore';

export function PaperPlane() {
  const groupRef = useRef<THREE.Group>(null);
  const visualsRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const { 
    wingArea, cogPosition, hasWinglets, dihedralAngle, thrust, 
    isFlying, updateStats, addFlightLog, updateLatestFeedback
  } = useStore();

  const pos = useRef(new THREE.Vector3(0, 2, 0));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const rot = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)));
  const angularVel = useRef(new THREE.Vector3(0, 0, 0));
  const timeInAir = useRef(0);
  const hasLogged = useRef(false);

  useEffect(() => {
    if (isFlying) {
      pos.current.set(0, 2, 0);
      vel.current.set(0, 2 + (thrust * 0.2), thrust * 2); // Throw forward/up
      rot.current.setFromEuler(new THREE.Euler(-0.2, 0, 0));
      angularVel.current.set(0, 0, 0);
      timeInAir.current = 0;
      hasLogged.current = false;
      
      if (groupRef.current) {
        groupRef.current.position.copy(pos.current);
        groupRef.current.quaternion.copy(rot.current);
      }
    } else {
      pos.current.set(0, 2, 0);
      vel.current.set(0, 0, 0);
      rot.current.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      if (groupRef.current) {
        groupRef.current.position.copy(pos.current);
        groupRef.current.quaternion.copy(rot.current);
      }
    }
  }, [isFlying, thrust]);

  useEffect(() => {
     if (isFlying) return;
     if (visualsRef.current) {
        const scale = Math.sqrt(wingArea / 150);
        visualsRef.current.scale.set(scale, scale, scale);
     }
  }, [wingArea, isFlying]);

  useFrame((state, delta) => {
    if (!isFlying) {
       if (groupRef.current) {
         groupRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
       }
       return;
    }

    const dt = Math.min(delta, 0.03); 
    timeInAir.current += dt;
    const speed = vel.current.length();
    
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(rot.current);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rot.current);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(rot.current);
    const velDir = speed > 0.1 ? vel.current.clone().normalize() : forward;

    let aoa = Math.asin(Math.max(-1, Math.min(1, up.dot(velDir)))); 
    if (isNaN(aoa)) aoa = 0;

    const rho = 1.225; 
    const S = wingArea / 10000; 
    const mass = 0.005; 

    const CL = Math.sin(aoa * 2) * 2; 
    const liftForce = 0.5 * rho * speed * speed * S * CL;
    const lift = up.clone().multiplyScalar(liftForce);

    const CD0 = hasWinglets ? 0.02 : 0.04;
    const CDi = (CL * CL) / (Math.PI * 2 * 0.8); 
    const dragForce = 0.5 * rho * speed * speed * S * (CD0 + CDi);
    const drag = velDir.clone().multiplyScalar(-dragForce);

    const gravity = new THREE.Vector3(0, -9.81 * mass, 0);

    const totalForce = new THREE.Vector3().add(lift).add(drag).add(gravity);
    const acc = totalForce.divideScalar(mass);

    vel.current.add(acc.clone().multiplyScalar(dt));
    pos.current.add(vel.current.clone().multiplyScalar(dt));

    const pitchMoment = (aoa * 0.05) + (cogPosition * liftForce * 0.02);
    const pitchDamping = angularVel.current.x * 0.02;
    angularVel.current.x += (pitchMoment - pitchDamping) * dt * 50;

    const maxAngVel = 10;
    angularVel.current.x = Math.max(-maxAngVel, Math.min(maxAngVel, angularVel.current.x));

    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, angularVel.current.x * dt);
    rot.current.premultiply(pitchQuat);
    rot.current.normalize();

    if (pos.current.y <= 0.1) {
      pos.current.y = 0.1; 
      vel.current.set(0, 0, 0);
      angularVel.current.set(0,0,0);
      
      const distance = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
      
      if (!hasLogged.current) {
        hasLogged.current = true;
        updateStats(distance, timeInAir.current);
        addFlightLog(distance, timeInAir.current);
        useStore.setState({ isFlying: false });

        fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             parameters: { wingArea, cogPosition, hasWinglets, dihedralAngle, thrust },
             distance,
             time: timeInAir.current,
             hasCrashed: true
          })
        })
        .then(res => res.json())
        .then(data => {
            updateLatestFeedback(data.feedback ?? '已记录飞行。配置 GEMINI_API_KEY 后可启用 AI 教练反馈。');
        })
        .catch(() => {
            updateLatestFeedback('已记录飞行。配置 GEMINI_API_KEY 后可启用 AI 教练反馈。');
        });
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos.current);
      groupRef.current.quaternion.copy(rot.current);
    }
    
    if (isFlying && pos.current.y > 0.1) {
       const idealOffset = new THREE.Vector3(5, 3, -5).applyQuaternion(rot.current);
       camera.position.lerp(pos.current.clone().add(idealOffset), 0.1);
       camera.lookAt(pos.current);
    }
  });

  const rightWingGroupRad = (dihedralAngle * Math.PI) / 180;
  const leftWingGroupRad = -(dihedralAngle * Math.PI) / 180;

  return (
    <group ref={groupRef}>
      <group ref={visualsRef}>
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        <group rotation={[0, 0, leftWingGroupRad]} position={[-0.01, 0.15, 0]}>
          <mesh castShadow receiveShadow position={[-0.4, 0, 0]} rotation={[0, 0.1, 0]}>
             <boxGeometry args={[0.8, 0.01, 0.6]} />
             <meshStandardMaterial color="#E0E0E0" roughness={0.2} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {hasWinglets && (
            <mesh castShadow receiveShadow position={[-0.8, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
               <boxGeometry args={[0.01, 0.2, 0.3]} />
               <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        <group rotation={[0, 0, rightWingGroupRad]} position={[0.01, 0.15, 0]}>
          <mesh castShadow receiveShadow position={[0.4, 0, 0]} rotation={[0, -0.1, 0]}>
             <boxGeometry args={[0.8, 0.01, 0.6]} />
             <meshStandardMaterial color="#E0E0E0" roughness={0.2} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {hasWinglets && (
            <mesh castShadow receiveShadow position={[0.8, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
               <boxGeometry args={[0.01, 0.2, 0.3]} />
               <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        <mesh position={[0, 0.2, (cogPosition * -0.3)]}>
           <sphereGeometry args={[0.05]} />
           <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
