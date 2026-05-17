'use client';

import { create } from 'zustand';

interface GameState {
  wingArea: number; // 100 to 300 cm^2
  cogPosition: number; // -1.0 (nose) to +1.0 (tail)
  hasWinglets: boolean;
  dihedralAngle: number; // 0 to 30 degrees
  thrust: number; // 1 to 10
  
  // App state
  isFlying: boolean;
  distanceFlown: number;
  flightTime: number;
  maxDistance: number;
  flightLogs: { id: number; dist: number; time: number; feedback: string | null }[];
  
  // Actions
  setWingArea: (val: number) => void;
  setCogPosition: (val: number) => void;
  setHasWinglets: (val: boolean) => void;
  setDihedralAngle: (val: number) => void;
  setThrust: (val: number) => void;
  
  throwPlane: () => void;
  resetPlane: () => void;
  updateStats: (distance: number, time: number) => void;
  addFlightLog: (dist: number, time: number) => void;
  updateLatestFeedback: (feedback: string) => void;
}

export const useStore = create<GameState>((set) => ({
  wingArea: 150,
  cogPosition: -0.2, // Slightly nose heavy is usually good
  hasWinglets: false,
  dihedralAngle: 10,
  thrust: 5,
  
  isFlying: false,
  distanceFlown: 0,
  flightTime: 0,
  maxDistance: 0,
  flightLogs: [],
  
  setWingArea: (val) => set({ wingArea: val }),
  setCogPosition: (val) => set({ cogPosition: val }),
  setHasWinglets: (val) => set({ hasWinglets: val }),
  setDihedralAngle: (val) => set({ dihedralAngle: val }),
  setThrust: (val) => set({ thrust: val }),
  
  throwPlane: () => set({ isFlying: true, distanceFlown: 0, flightTime: 0 }),
  resetPlane: () => set({ isFlying: false, distanceFlown: 0, flightTime: 0 }),
  
  updateStats: (distance, time) => set((state) => ({ 
    distanceFlown: distance, 
    flightTime: time,
    maxDistance: Math.max(state.maxDistance, distance)
  })),
  
  addFlightLog: (dist, time) => set((state) => ({
    flightLogs: [{ id: Date.now(), dist, time, feedback: null }, ...state.flightLogs].slice(0, 10)
  })),
  
  updateLatestFeedback: (feedback) => set((state) => {
    if (state.flightLogs.length === 0) return state;
    const newLogs = [...state.flightLogs];
    newLogs[0].feedback = feedback;
    return { flightLogs: newLogs };
  })
}));
