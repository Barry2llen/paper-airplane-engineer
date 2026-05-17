import type { FlightParameters } from './physics';
import { calculateTargetError, clamp, EGGDROP_TARGET_DISTANCE } from './physics';

export type MissionId = 'distance' | 'airtime' | 'eggdrop';
export type FlightGrade = 'S' | 'A' | 'B' | 'C';

export interface Mission {
  id: MissionId;
  name: string;
  target: string;
  description: string;
}

export interface FlightScoreInput {
  mission: MissionId;
  distance: number;
  time: number;
  stability: number;
  landingImpact: number;
  targetError?: number;
  parameters: FlightParameters;
}

export interface FlightResult {
  mission: MissionId;
  distance: number;
  time: number;
  stability: number;
  landingImpact: number;
  targetError?: number;
  score: number;
  grade: FlightGrade;
  missionSuccess: boolean;
  summary: string;
  suggestions: string[];
}

export const MISSIONS: Record<MissionId, Mission> = {
  distance: {
    id: 'distance',
    name: '远航挑战',
    target: '飞行距离达到 30 米',
    description: '优化投掷角度、重心和阻力，让纸飞机尽可能飞得更远。',
  },
  airtime: {
    id: 'airtime',
    name: '滞空挑战',
    target: '滞空时间达到 6 秒',
    description: '通过增大翼面积、控制重心和上反角，让纸飞机滑翔更久。',
  },
  eggdrop: {
    id: 'eggdrop',
    name: '鸡蛋空投',
    target: '落点靠近 25 米靶心，并降低着陆冲击',
    description: '纸飞机需要把一颗虚拟鸡蛋投送到目标区域，强调稳定性和柔和着陆。',
  },
};

export const MISSION_LIST = Object.values(MISSIONS);

export function calculateFlightScore(input: FlightScoreInput): FlightResult {
  const targetError = input.targetError ?? calculateTargetError(input.distance);
  const stabilityBonus = clamp(input.stability, 0, 100) * 0.14;
  const impactPenalty = Math.max(0, input.landingImpact - 4.5) * 4.2;
  let score = 0;
  let missionSuccess = false;
  let summary = '';

  if (input.mission === 'distance') {
    const distanceScore = clamp(input.distance / 30, 0, 1) * 78 + clamp((input.distance - 30) / 18, 0, 1) * 10;
    score = distanceScore + stabilityBonus - impactPenalty;
    missionSuccess = input.distance >= 30;
    summary = missionSuccess
      ? `远航任务完成，纸飞机飞过 ${input.distance.toFixed(1)} 米，已经进入稳定远航区间。`
      : `距离目标还差 ${(30 - input.distance).toFixed(1)} 米，当前设计需要继续降低阻力或优化投掷角度。`;
  }

  if (input.mission === 'airtime') {
    const timeScore = clamp(input.time / 6, 0, 1) * 78 + clamp((input.time - 6) / 3, 0, 1) * 10;
    const shortDistancePenalty = input.distance < 8 ? (8 - input.distance) * 1.8 : 0;
    score = timeScore + stabilityBonus - shortDistancePenalty - Math.max(0, input.landingImpact - 6) * 2;
    missionSuccess = input.time >= 6;
    summary = missionSuccess
      ? `滞空目标达成，${input.time.toFixed(1)} 秒的滑翔说明升力和稳定性配合良好。`
      : `滞空时间还差 ${(6 - input.time).toFixed(1)} 秒，需要提升升阻比并避免过早下沉。`;
  }

  if (input.mission === 'eggdrop') {
    const accuracyScore = clamp(1 - targetError / 14, 0, 1) * 52;
    const softLandingScore = clamp(1 - input.landingImpact / 8, 0, 1) * 28;
    score = accuracyScore + softLandingScore + clamp(input.stability, 0, 100) * 0.2;
    missionSuccess = targetError <= 3 && input.landingImpact <= 4.5;
    summary = missionSuccess
      ? `空投任务完成，落点距离 ${EGGDROP_TARGET_DISTANCE} 米靶心仅 ${targetError.toFixed(1)} 米，着陆冲击可控。`
      : `空投还需校准，当前落点误差 ${targetError.toFixed(1)} 米，着陆冲击 ${input.landingImpact.toFixed(1)}。`;
  }

  const normalizedScore = Math.round(clamp(score, 0, 100));

  return {
    mission: input.mission,
    distance: input.distance,
    time: input.time,
    stability: Math.round(clamp(input.stability, 0, 100)),
    landingImpact: Number(input.landingImpact.toFixed(1)),
    targetError: input.mission === 'eggdrop' ? Number(targetError.toFixed(1)) : undefined,
    score: normalizedScore,
    grade: gradeFromScore(normalizedScore),
    missionSuccess,
    summary,
    suggestions: buildSuggestions(input, targetError),
  };
}

function gradeFromScore(score: number): FlightGrade {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

function buildSuggestions(input: FlightScoreInput, targetError: number) {
  const suggestions: string[] = [];

  if (input.parameters.cogPosition > 0.4) {
    suggestions.push('重心偏后会抬头失速，建议向机头前移。');
  } else if (input.parameters.cogPosition < -0.7) {
    suggestions.push('重心太靠前会压低机头，建议稍微后移。');
  }

  if (input.parameters.wingArea < 100) {
    suggestions.push('机翼面积偏小，升力不足，可以适度增大翼面积。');
  } else if (input.parameters.wingArea > 260) {
    suggestions.push('翼面积过大正在增加阻力，可以略微收小机翼。');
  }

  if (input.mission === 'distance' && input.distance < 30) {
    suggestions.push('远航挑战优先寻找低阻力组合：中等翼面积、略靠前重心和 15° 到 25° 投掷角通常更稳。');
  }

  if (input.mission === 'airtime' && input.time < 6) {
    suggestions.push('滞空挑战需要更高升阻比，可增加一点翼面积并保持 10° 到 20° 上反角。');
  }

  if (input.mission === 'eggdrop') {
    if (targetError > 3) suggestions.push('鸡蛋空投要把落点调向 25 米靶心，优先微调投掷力度和角度。');
    if (input.landingImpact > 4.5) suggestions.push('着陆冲击偏大，降低投掷力度或提高稳定性可以保护虚拟鸡蛋。');
  }

  if (!input.parameters.hasWinglets) {
    suggestions.push('可以尝试翼梢小翼，减少翼尖涡流并提升横向稳定性。');
  }

  return suggestions.slice(0, 3);
}
