export interface FlightParameters {
  wingArea: number;
  cogPosition: number;
  hasWinglets: boolean;
  dihedralAngle: number;
  thrust: number;
  throwAngle: number;
}

export interface Aerodynamics {
  lift: number;
  drag: number;
  liftCoefficient: number;
  dragCoefficient: number;
  stability: number;
}

interface AerodynamicsInput {
  parameters: FlightParameters;
  speed: number;
  angleOfAttack: number;
}

interface LandingImpactInput {
  verticalSpeed: number;
  forwardSpeed: number;
  stability: number;
  thrust: number;
}

export const EGGDROP_TARGET_DISTANCE = 25;
const AERODYNAMIC_FORCE_SCALE = 0.065;
const STALL_START_AOA = 0.34;
const STALL_END_AOA = 0.75;
const MAX_LIFT_COEFFICIENT = 1.02;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateStability(
  parameters: FlightParameters,
  speed = 0,
  angleOfAttack = 0
) {
  const cgPenalty = Math.abs(parameters.cogPosition + 0.2) * 30;
  const tailHeavyPenalty = Math.max(0, parameters.cogPosition - 0.4) * 45;
  const noseHeavyPenalty = Math.max(0, -0.7 - parameters.cogPosition) * 35;
  const dihedralBoost = clamp(parameters.dihedralAngle, 0, 18) * 0.8;
  const excessiveDihedralPenalty = Math.max(0, parameters.dihedralAngle - 28) * 1.8;
  const wingAreaPenalty = Math.max(0, Math.abs(parameters.wingArea - 170) - 70) * 0.08;
  const wingletBoost = parameters.hasWinglets ? 8 : 0;
  const anglePenalty = Math.abs(angleOfAttack) * 42;
  const speedPenalty = Math.max(0, speed - 18) * 1.4;

  return clamp(
    70 + dihedralBoost + wingletBoost - cgPenalty - tailHeavyPenalty - noseHeavyPenalty - excessiveDihedralPenalty - wingAreaPenalty - anglePenalty - speedPenalty,
    0,
    100
  );
}

export function calculateAerodynamics({
  parameters,
  speed,
  angleOfAttack,
}: AerodynamicsInput): Aerodynamics {
  const rho = 1.225;
  const wingAreaMeters = parameters.wingArea / 10000;
  const boundedAoa = clamp(angleOfAttack, -0.75, 0.75);
  const wingRatio = clamp(parameters.wingArea / 150, 0.45, 2.1);
  const stallAmount = clamp((Math.abs(boundedAoa) - STALL_START_AOA) / (STALL_END_AOA - STALL_START_AOA), 0, 1);
  const linearLiftCoefficient = 4.2 * boundedAoa * (0.92 + wingRatio * 0.06);
  const liftCoefficient = clamp(linearLiftCoefficient, -MAX_LIFT_COEFFICIENT, MAX_LIFT_COEFFICIENT) * (1 - stallAmount * 0.48);
  const aspectRatio = 2.15 + clamp((parameters.wingArea - 100) / 220, 0, 1) * 0.55;
  const efficiency = parameters.hasWinglets ? 0.9 : 0.76;
  const inducedDrag = (liftCoefficient * liftCoefficient) / (Math.PI * aspectRatio * efficiency);
  const baseDrag = parameters.hasWinglets ? 0.026 : 0.038;
  const areaDrag = Math.max(0, parameters.wingArea - 180) * 0.00016;
  const dihedralDrag = Math.max(0, parameters.dihedralAngle - 18) * 0.002;
  const wingletDrag = parameters.hasWinglets ? 0.004 : 0;
  const stallDrag = stallAmount * stallAmount * 0.45;
  const dragCoefficient = baseDrag + areaDrag + dihedralDrag + wingletDrag + inducedDrag + stallDrag;
  const dynamicPressure = 0.5 * rho * speed * speed * wingAreaMeters * AERODYNAMIC_FORCE_SCALE;

  return {
    lift: dynamicPressure * liftCoefficient,
    drag: dynamicPressure * dragCoefficient,
    liftCoefficient,
    dragCoefficient,
    stability: calculateStability(parameters, speed, boundedAoa),
  };
}

export function calculateLandingImpact({
  verticalSpeed,
  forwardSpeed,
  stability,
  thrust,
}: LandingImpactInput) {
  const downwardSpeed = Math.abs(Math.min(0, verticalSpeed));
  const thrustPenalty = Math.max(0, thrust - 7) * 0.45;
  const stabilityRelief = (stability / 100) * 1.15;

  return clamp(downwardSpeed * 1.15 + forwardSpeed * 0.11 + thrustPenalty - stabilityRelief, 0, 10);
}

export function calculateTargetError(distance: number, targetDistance = EGGDROP_TARGET_DISTANCE) {
  return Math.abs(distance - targetDistance);
}

export function calculateInitialSpeed(thrust: number) {
  return 3.8 + 1.3 * clamp(thrust, 1, 10);
}
