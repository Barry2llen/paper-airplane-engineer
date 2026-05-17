'use client';

import type { ReactNode } from 'react';
import { useStore } from '@/hooks/useStore';
import { MISSION_LIST } from '@/lib/scoring';
import type { MissionId } from '@/lib/scoring';
import { SCENE_LIST } from '@/lib/scenes';

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">{children}</h2>;
}

function SceneSwatch({ color }: { color: string }) {
  return <span className="h-4 w-4 shrink-0 rounded-sm border border-white shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" style={{ backgroundColor: color }} />;
}

export function Sidebar() {
  const mission = useStore((state) => state.mission);
  const setMission = useStore((state) => state.setMission);
  const sceneId = useStore((state) => state.sceneId);
  const setSceneId = useStore((state) => state.setSceneId);
  const wingArea = useStore((state) => state.wingArea);
  const setWingArea = useStore((state) => state.setWingArea);
  const cogPosition = useStore((state) => state.cogPosition);
  const setCogPosition = useStore((state) => state.setCogPosition);
  const hasWinglets = useStore((state) => state.hasWinglets);
  const setHasWinglets = useStore((state) => state.setHasWinglets);
  const dihedralAngle = useStore((state) => state.dihedralAngle);
  const setDihedralAngle = useStore((state) => state.setDihedralAngle);
  const thrust = useStore((state) => state.thrust);
  const setThrust = useStore((state) => state.setThrust);
  const throwAngle = useStore((state) => state.throwAngle);
  const setThrowAngle = useStore((state) => state.setThrowAngle);
  const resetFlight = useStore((state) => state.resetFlight);
  const resetDesign = useStore((state) => state.resetDesign);

  return (
    <aside className="w-80 bg-white border-r border-[#D7DEE8] shadow-sm flex flex-col p-5 shrink-0 overflow-y-auto max-lg:w-full max-lg:border-r-0 max-lg:border-b">
      <div className="mb-7">
        <SectionTitle>任务选择</SectionTitle>
        <div className="space-y-2">
          {MISSION_LIST.map((item) => {
            const selected = mission === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMission(item.id as MissionId)}
                className={`w-full text-left rounded border p-3 transition-colors ${selected ? 'border-blue-500 bg-blue-50 shadow-[0_8px_20px_rgba(37,99,235,0.10)]' : 'border-[#D7DEE8] bg-white hover:border-blue-300 hover:bg-blue-50/50'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-900">{item.name}</span>
                  <span className={`h-2 w-2 rounded-full ${selected ? 'bg-blue-500' : 'bg-slate-300'}`} />
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{item.target}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-7">
        <SectionTitle>场景环境</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {SCENE_LIST.map((scene) => {
            const selected = sceneId === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => setSceneId(scene.id)}
                title={scene.description}
                className={`min-h-[76px] rounded border p-2 text-left transition-colors ${selected ? 'border-blue-500 bg-blue-50 shadow-[0_8px_20px_rgba(37,99,235,0.10)]' : 'border-[#D7DEE8] bg-white hover:border-blue-300 hover:bg-blue-50/50'}`}
                aria-pressed={selected}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <SceneSwatch color={scene.swatch} />
                  <span className={`h-2 w-2 rounded-full ${selected ? 'bg-blue-500' : 'bg-slate-300'}`} />
                </div>
                <span className="block text-[10px] font-bold leading-tight text-slate-900">{scene.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-7">
        <SectionTitle>机翼几何</SectionTitle>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>翼面积 (cm²)</span>
              <span className="text-blue-600">{wingArea}</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={wingArea}
              onChange={(e) => setWingArea(Number(e.target.value))}
              className="w-full accent-blue-600 h-1 bg-[#D7DEE8] rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>上反角</span>
              <span className="text-blue-600">+{dihedralAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="5"
              value={dihedralAngle}
              onChange={(e) => setDihedralAngle(Number(e.target.value))}
              className="w-full accent-blue-600 h-1 bg-[#D7DEE8] rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono">翼梢小翼</span>
              <button
                onClick={() => setHasWinglets(!hasWinglets)}
                className={`w-10 h-5 rounded-full relative transition-colors ${hasWinglets ? 'bg-blue-600' : 'bg-slate-300'}`}
                aria-label="切换翼梢小翼"
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${hasWinglets ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-7">
        <SectionTitle>重量与平衡</SectionTitle>
        <div className="p-4 bg-[#F8FAFC] border border-[#D7DEE8] rounded">
          <div className="flex justify-between mb-2 text-[10px]">
            <span className="text-slate-500">重心（机头 -1 到机尾 1）</span>
            <span className="text-green-600">{cogPosition.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={cogPosition}
            onChange={(e) => setCogPosition(Number(e.target.value))}
            className="w-full accent-green-600 h-1 bg-[#D7DEE8] rounded-full appearance-none outline-none mb-2"
          />
          <div className="relative h-12 bg-white flex items-center justify-center border-x-2 border-slate-300">
            <div className="absolute w-1 h-8 bg-amber-500 transition-all duration-150" style={{ left: `${50 + cogPosition * 40}%` }} />
            <div className="text-[9px] text-slate-500">机头 ---- 中心 ---- 机尾</div>
          </div>
        </div>
      </div>

      <div className="mb-7">
        <SectionTitle>投掷设置</SectionTitle>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>投掷力度</span>
              <span className="text-amber-400">等级 {thrust}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={thrust}
              onChange={(e) => setThrust(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-[#D7DEE8] rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>投掷角度</span>
              <span className="text-amber-400">{throwAngle}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={throwAngle}
              onChange={(e) => setThrowAngle(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-[#D7DEE8] rounded-full appearance-none outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-[#D7DEE8] pt-5">
        <SectionTitle>操作按钮</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={resetFlight} className="h-10 border border-[#D7DEE8] text-[10px] font-bold uppercase rounded flex items-center justify-center hover:bg-slate-100 text-slate-700">
            归位
          </button>
          <button onClick={resetDesign} className="h-10 border border-amber-500/40 text-[10px] font-bold uppercase rounded flex items-center justify-center hover:bg-amber-50 text-amber-700">
            恢复默认设计
          </button>
        </div>
      </div>
    </aside>
  );
}
