'use client';

import { useStore } from '@/hooks/useStore';
import Markdown from 'react-markdown';

export function FlightStats() {
  const { distanceFlown, flightTime, flightLogs, maxDistance } = useStore();
  const latestLog = flightLogs[0];

  return (
    <aside className="w-64 bg-[#121418] border-l border-[#2D3139] p-5 shrink-0 overflow-y-auto">
      <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-6">实时表现</h2>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-zinc-400">当前飞行距离</p>
          <p className="text-xl font-bold text-white font-mono">{distanceFlown.toFixed(2)} <span className="text-[10px] text-zinc-500">m</span></p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
            <span className="text-[10px] text-zinc-400 uppercase">个人最佳</span>
            <span className="text-xs font-mono text-blue-400">{maxDistance.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
            <span className="text-[10px] text-zinc-400 uppercase">滞空时间</span>
            <span className="text-xs font-mono text-amber-400">{flightTime.toFixed(2)}s</span>
          </div>
        </div>

        {latestLog && (
           <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded">
             <p className="text-[10px] text-blue-400 font-bold mb-1">工程师笔记</p>
             {latestLog.feedback ? (
                <div className="text-[10px] leading-relaxed text-blue-200/70 markdown-body prose prose-invert prose-sm">
                   <Markdown>{latestLog.feedback}</Markdown>
                </div>
             ) : (
                <p className="text-[10px] text-blue-400 animate-pulse">正在分析遥测数据...</p>
             )}
           </div>
        )}
      </div>
    </aside>
  );
}
