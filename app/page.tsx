'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FlightStats } from '@/components/FlightStats';
import { useStore } from '@/hooks/useStore';
import { MISSIONS } from '@/lib/scoring';
import { SCENES } from '@/lib/scenes';

const Scene = dynamic(() => import('@/components/Scene').then(mod => mod.Scene), { ssr: false });

export default function Home() {
  const throwPlane = useStore((state) => state.throwPlane);
  const isFlying = useStore((state) => state.isFlying);
  const flightStatus = useStore((state) => state.flightStatus);
  const thrust = useStore((state) => state.thrust);
  const throwAngle = useStore((state) => state.throwAngle);
  const mission = useStore((state) => state.mission);
  const sceneId = useStore((state) => state.sceneId);
  const currentMission = MISSIONS[mission];
  const currentScene = SCENES[sceneId];
  const statusText = flightStatus === 'flying' ? '试飞中' : flightStatus === 'completed' ? '已完成' : '设计中';

  return (
    <div className="flex flex-col h-full w-full bg-[#F4F7FB] text-[#182132] font-sans overflow-hidden max-lg:overflow-y-auto border-4 border-[#D7DEE8]">
      <header className="h-14 bg-[#F8FAFC] border-b border-[#D7DEE8] shadow-sm flex items-center justify-between px-6 shrink-0 z-10 max-md:h-auto max-md:flex-col max-md:items-start max-md:gap-3 max-md:py-3">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-sm shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.19c-.31.17-.69.17-1 0l-7.97-4.19c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.19c.31-.17.69-.17 1 0l7.97 4.19c.32.17.53.5.53.88v9z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#111827] leading-tight max-sm:text-xs max-sm:tracking-normal">Paper Airplane Engineer｜纸飞机工程师</h1>
            <p className="text-[10px] text-blue-600 font-mono tracking-tighter">航空实验室沙盒 | 虚拟风洞: 在线</p>
          </div>
        </div>
        <div className="flex gap-6 items-center max-md:w-full max-md:flex-wrap max-md:gap-3">
          <div className="text-right">
             <p className="text-[10px] uppercase text-slate-500 font-bold">当前任务</p>
             <p className="text-xs text-amber-600">{currentMission.name}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] uppercase text-slate-500 font-bold">当前状态</p>
             <p className="text-xs text-blue-700">{statusText}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] uppercase text-slate-500 font-bold">当前场景</p>
             <p className="text-xs" style={{ color: currentScene.swatch }}>{currentScene.name}</p>
           </div>
           <div className="h-8 w-[1px] bg-[#D7DEE8]"></div>
           <div className="px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-sm">蓝图模式</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-0 max-lg:flex-col max-lg:overflow-visible">
        <Sidebar />

        <main className="flex-1 relative flex items-center justify-center cursor-crosshair max-lg:min-h-[420px] max-lg:flex-none" style={{ backgroundColor: currentScene.background }}>
          <div className="absolute inset-0 opacity-50 pointer-events-none" style={{backgroundImage: 'radial-gradient(#93C5FD 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
          
          <div className="absolute bottom-8 left-8 flex flex-col gap-1 pointer-events-none z-10">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500"><span className="w-3 h-[1px] bg-red-500"></span> X 轴（纵向）</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500"><span className="w-3 h-[1px] bg-green-500"></span> Y 轴（横向）</div>
          </div>

          <div className="absolute inset-0">
            <Scene />
          </div>
        </main>

        <FlightStats />
      </div>

      <footer className="h-20 bg-white border-t border-[#D7DEE8] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-6 flex items-center justify-between shrink-0 z-10 max-md:h-auto max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:py-3">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">投放向量</p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">角度: {throwAngle}°</span>
              <span className="text-xs font-mono">力度: {thrust * 1.8}N</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-stretch">
           <div className="flex flex-col items-end mr-4 max-sm:mr-0 max-sm:items-start">
              <p className={`text-[10px] font-mono ${isFlying ? 'text-amber-500 blink-slow' : 'text-green-600 blink-slow'}`}>
                {isFlying ? '试飞进行中' : '准备试飞'}
              </p>
              <p className="text-[9px] text-slate-500">虚拟风洞已开启</p>
           </div>
           <button 
             onClick={throwPlane}
             disabled={isFlying}
             className="h-12 px-10 bg-amber-500 disabled:bg-amber-200 disabled:text-amber-600 text-black font-black text-sm tracking-widest rounded shadow-[0_8px_20px_rgba(245,158,11,0.22)] hover:scale-105 active:scale-95 transition-transform max-sm:w-full max-sm:px-4"
           >
             发射纸飞机
           </button>
        </div>
      </footer>
    </div>
  );
}
