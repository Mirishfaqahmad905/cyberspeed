import React from 'react';
import { Activity, ArrowDown, ArrowUp, Play, Square, Wifi, RotateCcw } from 'lucide-react';
import { TestStage } from '../types';

interface SpeedGaugeProps {
  stage: TestStage;
  currentSpeed: number;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  maxScaleSpeed?: number;
  onStart: () => void;
  onCancel: () => void;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  stage,
  currentSpeed,
  downloadSpeed,
  uploadSpeed,
  progress,
  maxScaleSpeed = 1000,
  onStart,
  onCancel,
}) => {
  const isTesting = stage === 'ping' || stage === 'download' || stage === 'upload';

  // SVG Geometry Settings
  const size = 360;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2 - 10;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // 360-degree circular gauge mapping
  const calculateGaugeRatio迷 = (speed: number) => {
    if (speed <= 0) return 0;
    if (speed <= 10) return (speed / 10) * 0.15;
    if (speed <= 50) return 0.15 + ((speed - 10) / 40) * 0.2;
    if (speed <= 100) return 0.35 + ((speed - 50) / 50) * 0.2;
    if (speed <= 500) return 0.55 + ((speed - 100) / 400) * 0.25;
    return 0.8 + Math.min(0.2, ((speed - 500) / 500) * 0.2);
  };

  const activeRatio = isTesting
    ? stage === 'ping'
      ? 0.1
      : calculateGaugeRatio迷(currentSpeed)
    : stage === 'complete'
    ? calculateGaugeRatio迷(downloadSpeed)
    : 0;

  // Full circle stroke-dash calculations
  const strokeDashoffset = circumference * (1 - Math.max(0.02, activeRatio));

  // Outer progress indicator ring
  const outerRadius = radius + 12;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerProgressOffset四周 = outerCircumference * (1 - progress / 100);

  // Stage display info
  const getStageMeta = () => {
    switch (stage) {
      case 'ping':
        return {
          glowColor: '#f59e0b',
          strokeColor: '#f59e0b',
          textColor: 'text-amber-400',
          label: 'CURRENT: PROBING LATENCY',
          step: 1,
        };
      case 'download':
        return {
          glowColor: '#06b6d4',
          strokeColor: '#06b6d4',
          textColor: 'text-cyan-400',
          label: 'CURRENT: DOWNLOADING',
          step: 2,
        };
      case 'upload':
        return {
          glowColor: '#a855f7',
          strokeColor: '#a855f7',
          textColor: 'text-purple-400',
          label: 'CURRENT: UPLOADING',
          step: 3,
        };
      case 'complete':
        return {
          glowColor: '#10b981',
          strokeColor: '#10b981',
          textColor: 'text-emerald-400',
          label: 'STATUS: BENCHMARK COMPLETE',
          step: 4,
        };
      default:
        return {
          glowColor: '#06b6d4',
          strokeColor: '#06b6d4',
          textColor: 'text-cyan-400',
          label: 'STATUS: ENGINE READY',
          step: 0,
        };
    }
  };

  const meta = getStageMeta();

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Background ambient circular aura */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: meta.glowColor }}
      />

      {/* Main Circular Gauge */}
      <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Subtle Outer Track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-white/[0.04]"
          />
          {isTesting && (
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              stroke={meta.strokeColor}
              strokeWidth="2"
              fill="none"
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerProgressOffset四周}
              strokeLinecap="round"
              className="transition-all duration-200 opacity-60"
            />
          )}

          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-white/5"
          />

          {/* Glowing Active Arc Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={meta.strokeColor}
            strokeWidth="5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${meta.glowColor})`,
              transition: 'stroke-dashoffset 0.15s ease-out, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center UI Content */}
        <div className="text-center z-10 flex flex-col items-center justify-center px-4">
          {stage === 'idle' ? (
            /* Idle Screen */
            <div className="flex flex-col items-center">
              <div className="text-6xl sm:text-7xl font-black italic tracking-tighter text-white mb-[-6px] leading-none">
                0.0
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">
                Mbps
              </div>
              <button
                id="start-speed-test-btn"
                onClick={onStart}
                className="bg-white/5 border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Start Test
              </button>
            </div>
          ) : isTesting ? (
            /* Testing Active Throughput Screen */
            <div className="flex flex-col items-center">
              <div className="text-7xl sm:text-8xl font-black italic tracking-tighter text-white mb-[-8px] leading-none font-mono-tech tabular-nums drop-shadow-lg">
                {stage === 'ping' ? '--' : currentSpeed.toFixed(1)}
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${meta.textColor} uppercase tracking-[0.2em] mb-4`}>
                {stage === 'ping' ? 'ms' : 'Mbps'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="cancel-speed-test-btn"
                  onClick={onCancel}
                  className="bg-rose-500/10 border border-rose-500/30 hover:border-rose-400 text-rose-300 px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Completed Screen */
            <div className="flex flex-col items-center">
              <div className="text-7xl sm:text-8xl font-black italic tracking-tighter text-emerald-400 mb-[-8px] leading-none font-mono-tech tabular-nums drop-shadow-lg">
                {downloadSpeed.toFixed(1)}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
                Mbps
              </div>
              <button
                id="retest-speed-btn"
                onClick={onStart}
                className="bg-white/5 border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Restart Test
              </button>
            </div>
          )}
        </div>

        {/* Bottom Current Stage & Step Indicators */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-8 flex flex-col items-center">
          <div className="text-[10px] uppercase text-slate-400 tracking-[0.25em] font-bold">
            {meta.label}
          </div>
          <div className="flex gap-1.5 mt-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-1.5 h-1.5 transition-colors duration-300 ${
                  isTesting
                    ? meta.step >= stepNum
                      ? 'bg-cyan-500 shadow-[0_0_6px_#06b6d4]'
                      : 'bg-slate-800'
                    : stage === 'complete'
                    ? 'bg-emerald-500'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

