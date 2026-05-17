'use client';

import { useStore } from '@/hooks/useStore';

export function Sidebar() {
  const { 
    wingArea, setWingArea, 
    cogPosition, setCogPosition, 
    hasWinglets, setHasWinglets, 
    dihedralAngle, setDihedralAngle, 
    thrust, setThrust,
    resetPlane 
  } = useStore();

  return (
    <aside className="w-72 bg-[#121418] border-r border-[#2D3139] flex flex-col p-5 shrink-0 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">机翼几何</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>翼面积 (cm²)</span>
              <span className="text-blue-400">{wingArea}</span>
            </div>
            <input 
              type="range" min="50" max="300" step="10" 
              value={wingArea} 
              onChange={(e) => setWingArea(Number(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-[#1F2229] rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>上反角</span>
              <span className="text-blue-400">+{dihedralAngle}°</span>
            </div>
            <input 
              type="range" min="0" max="45" step="5" 
              value={dihedralAngle} 
              onChange={(e) => setDihedralAngle(Number(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-[#1F2229] rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono">翼梢小翼</span>
              <button 
                onClick={() => setHasWinglets(!hasWinglets)}
                className={`w-10 h-5 rounded-full relative transition-colors ${hasWinglets ? 'bg-blue-500' : 'bg-[#1F2229]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${hasWinglets ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">重量与平衡</h2>
        <div className="p-4 bg-[#0A0B0D] border border-[#2D3139] rounded">
          <div className="flex justify-between mb-2 text-[10px]">
             <span className="text-zinc-400">重心（机头 -1 到机尾 1）</span>
             <span className="text-green-400">{cogPosition.toFixed(2)}</span>
          </div>
          <input 
              type="range" min="-1" max="1" step="0.1" 
              value={cogPosition} 
              onChange={(e) => setCogPosition(Number(e.target.value))}
              className="w-full accent-green-500 h-1 bg-[#1F2229] rounded-full appearance-none outline-none mb-2"
          />
          <div className="relative h-12 bg-[#15171C] flex items-center justify-center border-x-2 border-zinc-700">
             <div className="absolute w-1 h-8 bg-amber-500 transition-all duration-150" style={{left: `${50 + cogPosition * 40}%`}}></div>
             <div className="text-[9px] text-zinc-500">机头 ---- 中心 ---- 机尾</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">推进</h2>
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>投掷力度</span>
              <span className="text-amber-400">等级 {thrust}</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1" 
              value={thrust} 
              onChange={(e) => setThrust(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-[#1F2229] rounded-full appearance-none outline-none"
            />
        </div>
      </div>

      <div className="mt-auto border-t border-[#2D3139] pt-5">
        <div className="grid grid-cols-1 gap-2">
          <button onClick={resetPlane} className="h-10 border border-[#2D3139] text-[10px] font-bold uppercase rounded flex items-center justify-center hover:bg-[#1C1F26] text-white">重置纸飞机</button>
        </div>
      </div>
    </aside>
  );
}
