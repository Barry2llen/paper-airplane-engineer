'use client';

import { useStore } from '@/hooks/useStore';
import { MISSIONS } from '@/lib/scoring';
import Markdown from 'react-markdown';

function DataRow({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
      <span className="text-[10px] text-zinc-400 uppercase">{label}</span>
      <span className={`text-xs font-mono ${tone}`}>{value}</span>
    </div>
  );
}

export function FlightStats() {
  const mission = useStore((state) => state.mission);
  const flightStatus = useStore((state) => state.flightStatus);
  const distanceFlown = useStore((state) => state.distanceFlown);
  const flightTime = useStore((state) => state.flightTime);
  const maxDistance = useStore((state) => state.maxDistance);
  const altitude = useStore((state) => state.altitude);
  const speed = useStore((state) => state.speed);
  const lift = useStore((state) => state.lift);
  const drag = useStore((state) => state.drag);
  const stability = useStore((state) => state.stability);
  const landingImpact = useStore((state) => state.landingImpact);
  const targetError = useStore((state) => state.targetError);
  const score = useStore((state) => state.score);
  const grade = useStore((state) => state.grade);
  const missionSuccess = useStore((state) => state.missionSuccess);
  const latestResult = useStore((state) => state.latestResult);
  const bestResults = useStore((state) => state.bestResults);
  const flightLogs = useStore((state) => state.flightLogs);
  const latestLog = flightLogs[0];
  const currentMission = MISSIONS[mission];
  const bestResult = bestResults[mission];
  const statusText = flightStatus === 'flying' ? '试飞进行中' : flightStatus === 'completed' ? '试飞完成，查看工程师复盘' : '调整参数后点击发射';

  return (
    <aside className="w-80 bg-[#121418] border-l border-[#2D3139] p-5 shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">实时遥测</h2>
        <span className={`text-[10px] font-mono ${flightStatus === 'flying' ? 'text-amber-400 blink-slow' : 'text-blue-400'}`}>{statusText}</span>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0A0B0D] border border-[#2D3139] rounded p-4">
          <p className="text-[10px] font-mono text-zinc-400 mb-2">当前飞行距离</p>
          <p className="text-2xl font-bold text-white font-mono">
            {distanceFlown.toFixed(2)} <span className="text-[10px] text-zinc-500">m</span>
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#1F2229] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
            <span>{currentMission.name}</span>
            <span>{score}% 完成度</span>
          </div>
        </div>

        <div className="space-y-3">
          <DataRow label="滞空时间" value={`${flightTime.toFixed(2)}s`} tone="text-amber-400" />
          <DataRow label="高度" value={`${altitude.toFixed(2)}m`} tone="text-sky-300" />
          <DataRow label="速度" value={`${speed.toFixed(2)}m/s`} tone="text-white" />
          <DataRow label="升力" value={`${lift.toFixed(3)}N`} tone="text-green-300" />
          <DataRow label="阻力" value={`${drag.toFixed(3)}N`} tone="text-red-300" />
          <DataRow label="稳定性" value={`${stability.toFixed(0)}/100`} tone="text-blue-300" />
          {mission === 'eggdrop' && <DataRow label="靶心误差" value={`${(targetError ?? 0).toFixed(1)}m`} tone="text-amber-300" />}
          <DataRow label="个人最佳距离" value={`${maxDistance.toFixed(2)}m`} tone="text-blue-400" />
          <DataRow label="当前任务最佳" value={bestResult ? `${bestResult.score}分 / ${bestResult.grade}级` : '暂无'} tone="text-amber-400" />
        </div>

        {latestResult && (
          <div className="relative overflow-hidden rounded border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-[#0A0B0D] to-blue-500/10 p-4 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">结果报告</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">{latestResult.summary}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white font-mono leading-none">{grade}</p>
                <p className="text-[10px] text-amber-300">{score} 分</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="rounded bg-black/25 p-2 text-zinc-300">距离 {latestResult.distance.toFixed(2)}m</div>
              <div className="rounded bg-black/25 p-2 text-zinc-300">滞空 {latestResult.time.toFixed(2)}s</div>
              <div className="rounded bg-black/25 p-2 text-zinc-300">稳定 {latestResult.stability}/100</div>
              <div className="rounded bg-black/25 p-2 text-zinc-300">冲击 {landingImpact.toFixed(1)}/10</div>
            </div>
            <p className={`mt-3 text-[11px] font-bold ${missionSuccess ? 'text-green-300' : 'text-amber-300'}`}>
              {missionSuccess ? '任务完成' : '任务未完成，继续迭代设计'}
            </p>
          </div>
        )}

        <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded">
          <p className="text-[10px] text-blue-400 font-bold mb-1">工程师笔记</p>
          {latestLog?.feedback ? (
            <div className="text-[10px] leading-relaxed text-blue-100/80 markdown-body prose prose-invert prose-sm">
              <Markdown>{latestLog.feedback}</Markdown>
            </div>
          ) : latestLog ? (
            <p className="text-[10px] text-blue-400 animate-pulse">正在分析遥测数据...</p>
          ) : (
            <p className="text-[10px] leading-relaxed text-blue-100/60">选择任务并调整参数后发射。落地后这里会生成 2 到 4 句工程师复盘建议。</p>
          )}
        </div>
      </div>
    </aside>
  );
}
