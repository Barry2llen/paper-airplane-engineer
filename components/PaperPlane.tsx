'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/hooks/useStore';
import type { FlightParameters } from '@/lib/physics';
import {
  calculateAerodynamics,
  calculateInitialSpeed,
  calculateLandingImpact,
  calculateTargetError,
  degreesToRadians,
} from '@/lib/physics';
import { calculateFlightScore } from '@/lib/scoring';
import type { MissionId } from '@/lib/scoring';

const MAX_FRAME_DELTA = 0.03;
const FLIGHT_PLAYBACK_SPEED = 0.45;
const TELEMETRY_REFRESH_SECONDS = 0.1;
const LAUNCH_HEIGHT = 3;
const GROUND_CLEARANCE = 0.08;
const LANDING_FLARE_ALTITUDE = 1;
const MAX_DESCENT_SPEED = 0.65;

function createPanelGeometry(vertices: Array<[number, number, number]>) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));

  if (vertices.length === 4) {
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export function PaperPlane() {
  const groupRef = useRef<THREE.Group>(null);
  const visualsRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const wingArea = useStore((state) => state.wingArea);
  const cogPosition = useStore((state) => state.cogPosition);
  const hasWinglets = useStore((state) => state.hasWinglets);
  const dihedralAngle = useStore((state) => state.dihedralAngle);
  const thrust = useStore((state) => state.thrust);
  const throwAngle = useStore((state) => state.throwAngle);
  const mission = useStore((state) => state.mission);
  const isFlying = useStore((state) => state.isFlying);
  const flightStatus = useStore((state) => state.flightStatus);
  const updateTelemetry = useStore((state) => state.updateTelemetry);
  const completeFlight = useStore((state) => state.completeFlight);
  const updateFlightFeedback = useStore((state) => state.updateFlightFeedback);

  const latestParamsRef = useRef<FlightParameters>({
    wingArea,
    cogPosition,
    hasWinglets,
    dihedralAngle,
    thrust,
    throwAngle,
  });
  const latestMissionRef = useRef<MissionId>(mission);
  const flightParamsRef = useRef<FlightParameters>(latestParamsRef.current);
  const flightMissionRef = useRef<MissionId>(mission);
  const pos = useRef(new THREE.Vector3(0, LAUNCH_HEIGHT, 0));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const rot = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)));
  const angularVel = useRef(new THREE.Vector3(0, 0, 0));
  const timeInAir = useRef(0);
  const telemetryTimer = useRef(0);
  const hasLogged = useRef(false);

  useEffect(() => {
    latestParamsRef.current = {
      wingArea,
      cogPosition,
      hasWinglets,
      dihedralAngle,
      thrust,
      throwAngle,
    };
  }, [wingArea, cogPosition, hasWinglets, dihedralAngle, thrust, throwAngle]);

  useEffect(() => {
    latestMissionRef.current = mission;
  }, [mission]);

  useEffect(() => {
    if (isFlying) {
      const parameters = latestParamsRef.current;
      const initialSpeed = calculateInitialSpeed(parameters.thrust);
      const launchAngle = degreesToRadians(parameters.throwAngle);

      flightParamsRef.current = parameters;
      flightMissionRef.current = latestMissionRef.current;
      pos.current.set(0, LAUNCH_HEIGHT, 0);
      vel.current.set(0, initialSpeed * Math.sin(launchAngle), initialSpeed * Math.cos(launchAngle));
      rot.current.setFromEuler(new THREE.Euler(-launchAngle, 0, 0));
      angularVel.current.set(0, 0, 0);
      timeInAir.current = 0;
      telemetryTimer.current = 0;
      hasLogged.current = false;

      if (groupRef.current) {
        groupRef.current.position.copy(pos.current);
        groupRef.current.quaternion.copy(rot.current);
      }
      return;
    }

    if (flightStatus === 'designing') {
      pos.current.set(0, LAUNCH_HEIGHT, 0);
      vel.current.set(0, 0, 0);
      rot.current.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      angularVel.current.set(0, 0, 0);

      if (groupRef.current) {
        groupRef.current.position.copy(pos.current);
        groupRef.current.quaternion.copy(rot.current);
      }
    }
  }, [isFlying, flightStatus]);

  useEffect(() => {
    if (isFlying) return;
    if (visualsRef.current) {
      const scale = Math.sqrt(wingArea / 150);
      visualsRef.current.scale.set(scale, scale, scale);
    }
  }, [wingArea, isFlying]);

  useFrame((state, delta) => {
    if (!isFlying) {
      if (groupRef.current && flightStatus === 'designing') {
        groupRef.current.position.y = LAUNCH_HEIGHT + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
      return;
    }

    const parameters = flightParamsRef.current;
    const activeMission = flightMissionRef.current;
    const frameDt = Math.min(delta, MAX_FRAME_DELTA);
    const dt = frameDt * FLIGHT_PLAYBACK_SPEED;
    timeInAir.current += dt;
    telemetryTimer.current += frameDt;
    const speed = vel.current.length();

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(rot.current);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rot.current);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(rot.current);
    const velDir = speed > 0.1 ? vel.current.clone().normalize() : forward;

    let angleOfAttack = Math.asin(Math.max(-1, Math.min(1, up.dot(velDir))));
    if (Number.isNaN(angleOfAttack)) angleOfAttack = 0;

    const aerodynamics = calculateAerodynamics({
      parameters,
      speed,
      angleOfAttack,
    });
    const lift = up.clone().multiplyScalar(aerodynamics.lift);
    const drag = velDir.clone().multiplyScalar(-aerodynamics.drag);
    const mass = 0.005;
    const gravity = new THREE.Vector3(0, -9.81 * mass, 0);
    const totalForce = new THREE.Vector3().add(lift).add(drag).add(gravity);
    const acc = totalForce.divideScalar(mass);

    vel.current.add(acc.clone().multiplyScalar(dt));

    const altitudeAboveGround = pos.current.y - GROUND_CLEARANCE;
    if (altitudeAboveGround <= LANDING_FLARE_ALTITUDE && vel.current.y < 0) {
      const flareStrength = 1 - THREE.MathUtils.clamp(altitudeAboveGround / LANDING_FLARE_ALTITUDE, 0, 1);
      const stabilityRelief = 0.55 + (aerodynamics.stability / 100) * 0.35;
      const descentLimit = THREE.MathUtils.lerp(2.2, MAX_DESCENT_SPEED, flareStrength * stabilityRelief);

      if (vel.current.y < -descentLimit) {
        vel.current.y = THREE.MathUtils.lerp(vel.current.y, -descentLimit, 0.65);
      }

      const horizontalDamping = 1 - Math.min(0.28, frameDt * flareStrength * 2.2);
      vel.current.x *= horizontalDamping;
      vel.current.z *= horizontalDamping;
      angularVel.current.multiplyScalar(1 - Math.min(0.45, dt * flareStrength * 4));
    }

    pos.current.add(vel.current.clone().multiplyScalar(dt));

    const stabilityFactor = aerodynamics.stability / 100;
    const tailHeavyMoment = Math.max(0, parameters.cogPosition - 0.35) * 0.035;
    const noseHeavyMoment = Math.max(0, -0.65 - parameters.cogPosition) * 0.018;
    const pitchMoment = (angleOfAttack * 0.05) + (parameters.cogPosition * aerodynamics.lift * 0.02) + tailHeavyMoment - noseHeavyMoment;
    const pitchDamping = angularVel.current.x * (0.012 + stabilityFactor * 0.03);
    angularVel.current.x += (pitchMoment - pitchDamping) * dt * 50;

    const maxAngVel = 10;
    angularVel.current.x = Math.max(-maxAngVel, Math.min(maxAngVel, angularVel.current.x));

    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, angularVel.current.x * dt);
    rot.current.premultiply(pitchQuat);
    rot.current.normalize();

    const distance = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
    const horizontalSpeed = Math.sqrt(vel.current.x ** 2 + vel.current.z ** 2);
    const targetError = activeMission === 'eggdrop' ? calculateTargetError(distance) : undefined;

    if (telemetryTimer.current >= TELEMETRY_REFRESH_SECONDS) {
      telemetryTimer.current = 0;
      const estimatedImpact = calculateLandingImpact({
        verticalSpeed: vel.current.y,
        forwardSpeed: horizontalSpeed,
        stability: aerodynamics.stability,
        thrust: parameters.thrust,
      });
      const liveResult = calculateFlightScore({
        mission: activeMission,
        distance,
        time: timeInAir.current,
        stability: aerodynamics.stability,
        landingImpact: estimatedImpact,
        targetError,
        parameters,
      });

      updateTelemetry({
        distanceFlown: distance,
        flightTime: timeInAir.current,
        altitude: Math.max(0, pos.current.y),
        speed,
        lift: Math.max(0, aerodynamics.lift),
        drag: Math.max(0, aerodynamics.drag),
        stability: Math.round(aerodynamics.stability),
        landingImpact: estimatedImpact,
        targetError,
        score: liveResult.score,
        grade: liveResult.grade,
        missionSuccess: liveResult.missionSuccess,
      });
    }

    if (pos.current.y <= GROUND_CLEARANCE) {
      const landingVerticalSpeed = vel.current.y;
      const landingHorizontalSpeed = Math.sqrt(vel.current.x ** 2 + vel.current.z ** 2);
      pos.current.y = GROUND_CLEARANCE;
      vel.current.set(0, 0, 0);
      angularVel.current.set(0, 0, 0);

      if (!hasLogged.current) {
        hasLogged.current = true;
        const landingImpact = calculateLandingImpact({
          verticalSpeed: landingVerticalSpeed,
          forwardSpeed: landingHorizontalSpeed,
          stability: aerodynamics.stability,
          thrust: parameters.thrust,
        });
        const result = calculateFlightScore({
          mission: activeMission,
          distance,
          time: timeInAir.current,
          stability: aerodynamics.stability,
          landingImpact,
          targetError,
          parameters,
        });
        const logId = completeFlight(result);

        fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mission: activeMission,
            parameters,
            result,
            distance,
            time: timeInAir.current,
            stability: result.stability,
            landingImpact,
            targetError,
            hasCrashed: true,
          }),
        })
          .then((res) => res.json())
          .then((data: { feedback?: string }) => {
            updateFlightFeedback(logId, data.feedback ?? '工程师教练已记录本次试飞，请继续调整参数再试一次。');
          })
          .catch(() => {
            updateFlightFeedback(logId, '工程师教练已记录本次试飞，请继续调整参数再试一次。');
          });
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos.current);
      groupRef.current.quaternion.copy(rot.current);
    }

    if (isFlying && pos.current.y > GROUND_CLEARANCE) {
      const idealOffset = new THREE.Vector3(5, 3.4, -5.8).applyQuaternion(rot.current);
      camera.position.lerp(pos.current.clone().add(idealOffset), 0.1);
      camera.lookAt(pos.current);
    }
  });

  const rightWingGroupRad = degreesToRadians(dihedralAngle);
  const leftWingGroupRad = -degreesToRadians(dihedralAngle);
  const leftWingGeometry = useMemo(() => createPanelGeometry([
    [0, 0.03, 0.95],
    [-0.9, 0, -0.36],
    [0, 0.02, -0.82],
  ]), []);
  const rightWingGeometry = useMemo(() => createPanelGeometry([
    [0, 0.03, 0.95],
    [0, 0.02, -0.82],
    [0.9, 0, -0.36],
  ]), []);
  const leftBellyGeometry = useMemo(() => createPanelGeometry([
    [0, 0.02, 0.9],
    [0, -0.12, -0.78],
    [-0.18, -0.06, -0.36],
  ]), []);
  const rightBellyGeometry = useMemo(() => createPanelGeometry([
    [0, 0.02, 0.9],
    [0.18, -0.06, -0.36],
    [0, -0.12, -0.78],
  ]), []);
  const wingletGeometry = useMemo(() => createPanelGeometry([
    [0, 0, 0.2],
    [0, 0.28, -0.02],
    [0, 0, -0.22],
  ]), []);

  return (
    <group ref={groupRef}>
      <group ref={visualsRef}>
        <group rotation={[0, 0, leftWingGroupRad]}>
          <mesh castShadow receiveShadow geometry={leftWingGeometry}>
            <meshStandardMaterial color="#F8FAFC" roughness={0.58} metalness={0} side={THREE.DoubleSide} />
          </mesh>
          <Line points={[[0, 0.035, 0.9], [-0.84, 0.01, -0.35]]} color="#CBD5E1" lineWidth={1} />
          {hasWinglets && (
            <mesh castShadow receiveShadow geometry={wingletGeometry} position={[-0.86, 0.02, -0.28]} rotation={[0, 0.18, 0]}>
              <meshStandardMaterial color="#DBEAFE" roughness={0.45} metalness={0} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        <group rotation={[0, 0, rightWingGroupRad]}>
          <mesh castShadow receiveShadow geometry={rightWingGeometry}>
            <meshStandardMaterial color="#EEF2F7" roughness={0.62} metalness={0} side={THREE.DoubleSide} />
          </mesh>
          <Line points={[[0, 0.035, 0.9], [0.84, 0.01, -0.35]]} color="#CBD5E1" lineWidth={1} />
          {hasWinglets && (
            <mesh castShadow receiveShadow geometry={wingletGeometry} position={[0.86, 0.02, -0.28]} rotation={[0, -0.18, 0]}>
              <meshStandardMaterial color="#DBEAFE" roughness={0.45} metalness={0} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        <mesh castShadow receiveShadow geometry={leftBellyGeometry}>
          <meshStandardMaterial color="#E2E8F0" roughness={0.7} metalness={0} side={THREE.DoubleSide} />
        </mesh>

        <mesh castShadow receiveShadow geometry={rightBellyGeometry}>
          <meshStandardMaterial color="#F1F5F9" roughness={0.68} metalness={0} side={THREE.DoubleSide} />
        </mesh>

        <Line points={[[0, 0.05, 0.96], [0, -0.02, -0.82]]} color="#94A3B8" lineWidth={1.5} />
        <Line points={[[-0.18, -0.055, -0.36], [0, -0.12, -0.78], [0.18, -0.055, -0.36]]} color="#CBD5E1" lineWidth={1} />

        <mesh position={[0, 0.16, cogPosition * -0.35]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
