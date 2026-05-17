'use client';

import { create } from 'zustand';
import type { FlightParameters } from '@/lib/physics';
import type { FlightGrade, FlightResult, MissionId } from '@/lib/scoring';
import type { SceneId } from '@/lib/scenes';

const DEFAULT_PARAMETERS: FlightParameters = {
  wingArea: 150,
  cogPosition: -0.2,
  hasWinglets: false,
  dihedralAngle: 10,
  thrust: 5,
  throwAngle: 15,
};

type BestResult = {
  score: number;
  grade: FlightGrade;
  distance: number;
  time: number;
} | null;

type FlightLog = {
  id: number;
  mission: MissionId;
  dist: number;
  time: number;
  score: number;
  grade: FlightGrade;
  missionSuccess: boolean;
  feedback: string | null;
};

interface GameState extends FlightParameters {
  mission: MissionId;
  sceneId: SceneId;

  isFlying: boolean;
  flightStatus: 'designing' | 'flying' | 'completed';
  distanceFlown: number;
  flightTime: number;
  maxDistance: number;
  altitude: number;
  speed: number;
  lift: number;
  drag: number;
  stability: number;
  landingImpact: number;
  targetError?: number;
  score: number;
  grade: FlightGrade;
  missionSuccess: boolean;
  latestResult: FlightResult | null;
  bestResults: Record<MissionId, BestResult>;
  flightLogs: FlightLog[];

  setMission: (mission: MissionId) => void;
  setSceneId: (sceneId: SceneId) => void;
  setWingArea: (val: number) => void;
  setCogPosition: (val: number) => void;
  setHasWinglets: (val: boolean) => void;
  setDihedralAngle: (val: number) => void;
  setThrust: (val: number) => void;
  setThrowAngle: (val: number) => void;

  throwPlane: () => void;
  resetFlight: () => void;
  resetDesign: () => void;
  updateTelemetry: (telemetry: Partial<Pick<GameState, 'distanceFlown' | 'flightTime' | 'altitude' | 'speed' | 'lift' | 'drag' | 'stability' | 'landingImpact' | 'targetError' | 'score' | 'grade' | 'missionSuccess'>>) => void;
  completeFlight: (result: FlightResult) => number;
  updateFlightFeedback: (id: number, feedback: string) => void;
  updateLatestFeedback: (feedback: string) => void;
}

function emptyBestResults(): Record<MissionId, BestResult> {
  return {
    distance: null,
    airtime: null,
    eggdrop: null,
  };
}

function resetTelemetry() {
  return {
    distanceFlown: 0,
    flightTime: 0,
    altitude: 0,
    speed: 0,
    lift: 0,
    drag: 0,
    stability: 0,
    landingImpact: 0,
    targetError: undefined,
    score: 0,
    grade: 'C' as FlightGrade,
    missionSuccess: false,
    latestResult: null,
  };
}

export const useStore = create<GameState>((set, get) => ({
  ...DEFAULT_PARAMETERS,
  mission: 'distance',
  sceneId: 'lab',

  isFlying: false,
  flightStatus: 'designing',
  maxDistance: 0,
  bestResults: emptyBestResults(),
  flightLogs: [],
  ...resetTelemetry(),

  setMission: (mission) => set({ mission }),
  setSceneId: (sceneId) => set({ sceneId }),
  setWingArea: (val) => set({ wingArea: val }),
  setCogPosition: (val) => set({ cogPosition: val }),
  setHasWinglets: (val) => set({ hasWinglets: val }),
  setDihedralAngle: (val) => set({ dihedralAngle: val }),
  setThrust: (val) => set({ thrust: val }),
  setThrowAngle: (val) => set({ throwAngle: val }),

  throwPlane: () => set({ isFlying: true, flightStatus: 'flying', ...resetTelemetry() }),

  resetFlight: () => set({ isFlying: false, flightStatus: 'designing', ...resetTelemetry() }),

  resetDesign: () => set({
    ...DEFAULT_PARAMETERS,
    isFlying: false,
    flightStatus: 'designing',
    ...resetTelemetry(),
  }),

  updateTelemetry: (telemetry) => set((state) => ({
    ...telemetry,
    maxDistance: Math.max(state.maxDistance, telemetry.distanceFlown ?? state.distanceFlown),
  })),

  completeFlight: (result) => {
    const id = Date.now();
    set((state) => {
      const previousBest = state.bestResults[result.mission];
      const nextBest = previousBest && previousBest.score >= result.score
        ? previousBest
        : {
            score: result.score,
            grade: result.grade,
            distance: result.distance,
            time: result.time,
          };

      return {
        isFlying: false,
        flightStatus: 'completed',
        distanceFlown: result.distance,
        flightTime: result.time,
        altitude: 0,
        speed: 0,
        lift: 0,
        drag: 0,
        stability: result.stability,
        landingImpact: result.landingImpact,
        targetError: result.targetError,
        score: result.score,
        grade: result.grade,
        missionSuccess: result.missionSuccess,
        latestResult: result,
        maxDistance: Math.max(state.maxDistance, result.distance),
        bestResults: {
          ...state.bestResults,
          [result.mission]: nextBest,
        },
        flightLogs: [
          {
            id,
            mission: result.mission,
            dist: result.distance,
            time: result.time,
            score: result.score,
            grade: result.grade,
            missionSuccess: result.missionSuccess,
            feedback: null,
          },
          ...state.flightLogs,
        ].slice(0, 10),
      };
    });
    return id;
  },

  updateFlightFeedback: (id, feedback) => set((state) => ({
    flightLogs: state.flightLogs.map((log) => (
      log.id === id ? { ...log, feedback } : log
    )),
  })),

  updateLatestFeedback: (feedback) => {
    const latest = get().flightLogs[0];
    if (!latest) return;
    get().updateFlightFeedback(latest.id, feedback);
  },
}));
