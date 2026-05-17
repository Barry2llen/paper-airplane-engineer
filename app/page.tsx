'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FlightStats } from '@/components/FlightStats';
import { useStore } from '@/hooks/useStore';

const Scene = dynamic(() => import('@/components/Scene').then(mod => mod.Scene), { ssr: false });

export default function Home() {
  const { throwPlane, isFlying, thrust } = useStore();

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0B0D] text-[#E0E0E0] font-sans overflow-hidden border-4 border-[#1F2229]">
      <header className="h-14 bg-[#15171C] border-b border-[#2D3139] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500 flex items-center justify-center rounded-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.19c-.31.17-.69.17-1 0l-7.97-4.19c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.19c.31-.17.69-.17 1 0l7.97 4.19c.32.17.53.5.53.88v9z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#F0F0F0]">纸飞机工程师</h1>
            <p className="text-[10px] text-blue-500 font-mono tracking-tighter">系统状态: 最佳 | 风速: 2.4m/s 北东北</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[10px] uppercase text-zinc-500 font-bold">当前任务</p>
            <p className="text-xs text-amber-400">最大距离: 测试区</p>
          </div>
          <div className="h-8 w-[1px] bg-[#2D3139]"></div>
          <button className="px-4 py-1 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200">蓝图模式</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-0">
        <Sidebar />

        <main className="flex-1 bg-[#0F1115] relative flex items-center justify-center cursor-crosshair">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
          
          <div className="absolute bottom-8 left-8 flex flex-col gap-1 pointer-events-none z-10">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500"><span className="w-3 h-[1px] bg-red-500"></span> X 轴（纵向）</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500"><span className="w-3 h-[1px] bg-green-500"></span> Y 轴（横向）</div>
          </div>

          <div className="absolute inset-0">
            <Scene />
          </div>
        </main>

        <FlightStats />
      </div>

      <footer className="h-20 bg-[#15171C] border-t border-[#2D3139] px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">投放向量</p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">角度: 12°</span>
              <span className="text-xs font-mono">力度: {thrust * 1.8}N</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end mr-4">
              <p className={`text-[10px] font-mono ${isFlying ? 'text-amber-500 blink-slow' : 'text-green-500 blink-slow'}`}>
                {isFlying ? '试飞进行中' : '准备试飞'}
              </p>
              <p className="text-[9px] text-zinc-600">虚拟风洞已开启</p>
           </div>
           <button 
             onClick={throwPlane}
             disabled={isFlying}
             className="h-12 px-10 bg-amber-500 disabled:bg-amber-800 disabled:text-amber-400 text-black font-black text-sm tracking-widest rounded shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-transform"
           >
             发射纸飞机
           </button>
        </div>
      </footer>
    </div>
  );
}
