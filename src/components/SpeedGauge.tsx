import React from 'react';
import { Activity, ArrowDown, ArrowUp, Play, Square, Wifi, RotateCcw, Clock, Gauge } from 'lucide-react';
import { SpeedUnit, TestDurationSeconds, TestStage } from '../types';
import { formatSpeedDisplay, getSpeedNumericValue, getSpeedUnitLabel } from '../utils/speedFormat';

interface SpeedGaugeProps {
  stage: TestStage;
  currentSpeed: number; // in Mbps
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  progress: number;
  speedUnit: SpeedUnit;
  testDurationSeconds: TestDurationSeconds;
  elapsedSeconds?: number;
  onSelectUnit?: (unit: SpeedUnit) => void;
  onSelectDuration?: (duration: TestDurationSeconds) => void;
  onStart: () => void;
  onCancel: () => void;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  stage,
  currentSpeed,
  downloadSpeed,
  uploadSpeed,
  progress,
  speedUnit = 'dual',
  testDurationSeconds = 60,
  elapsedSeconds = 0,
  onSelectUnit,
  onSelectDuration,
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
  const calculateGaugeRatio = (speedMbps: number) => {
    if (speedMbps <= 0) return 0;
    if (speedMbps <= 10) return (speedMbps / 10) * 0.15;
    if (speedMbps <= 50) return 0.15 + ((speedMbps - 10) / 40) * 0.2;
    if (speedMbps <= 100) return 0.35 + ((speedMbps - 50) / 50) * 0.2;
    if (speedMbps <= 500) return 0.55 + ((speedMbps - 100) / 400) * 0.25;
    return 0.8 + Math.min(0.2, ((speedMbps - 500) / 500) * 0.2);
  };

  const activeRatio = isTesting
    ? stage === 'ping'
      ? 0.1
      : calculateGaugeRatio(currentSpeed)
    : stage === 'complete'
    ? calculateGaugeRatio(downloadSpeed)
    : 0;

  // Full circle stroke-dash calculations
  const strokeDashoffset = circumference * (1 - Math.max(0.02, activeRatio));

  // Outer progress indicator ring
  const outerRadius = radius + 12;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerProgressOffset = outerCircumference * (1 - progress / 100);

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
          label: 'CURRENT: DOWNLOADING STREAM',
          step: 2,
        };
      case 'upload':
        return {
          glowColor: '#a855f7',
          strokeColor: '#a855f7',
          textColor: 'text-purple-400',
          label: 'CURRENT: UPLOADING STREAM',
          step: 3,
        };
      case 'complete':
        return {
          glowColor: '#10b981',
          strokeColor: '#10b981',
          textColor: 'text-emerald-400',
          label: 'STATUS: BENCHMARK VERIFIED',
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

  // Primary display speed & secondary dual display
  const primaryDisplaySpeed = isTesting
    ? stage === 'ping'
      ? '--'
      : speedUnit === 'kbps'
      ? Math.round(currentSpeed * 1000).toLocaleString()
      : currentSpeed.toFixed(1)
    : stage === 'complete'
    ? speedUnit === 'kbps'
      ? Math.round(downloadSpeed * 1000).toLocaleString()
      : downloadSpeed.toFixed(1)
    : '0.0';

  const secondaryKbpsVal = isTesting
    ? Math.round(currentSpeed * 1000).toLocaleString()
    : Math.round(downloadSpeed * 1000).toLocaleString();

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Background ambient circular aura */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: meta.glowColor }}
      />

      {/* Top Test Duration & Unit Quick Selector */}
      <div className="flex items-center justify-between w-full max-w-sm px-2 mb-2 text-[10px] font-mono-tech">
        {/* Test Duration Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
          <Clock className="w-3 h-3 text-cyan-400 ml-1.5" />
          <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Time:</span>
          {([10, 30, 60] as TestDurationSeconds[]).map((dur) => (
            <button
              key={dur}
              type="button"
              disabled={isTesting}
              onClick={() => onSelectDuration && onSelectDuration(dur)}
              className={`px-2 py-0.5 rounded-full font-bold uppercase transition-all cursor-pointer ${
                testDurationSeconds === dur
                  ? 'bg-cyan-500 text-[#050510] shadow-sm'
                  : 'text-slate-400 hover:text-white disabled:opacity-50'
              }`}
            >
              {dur === 60 ? '1 Min' : `${dur}s`}
            </button>
          ))}
        </div>

        {/* Speed Unit Selector (Mbps / Kbps / Dual) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
          <Gauge className="w-3 h-3 text-cyan-400 ml-1.5" />
          {([
            { id: 'mbps', label: 'Mbps' },
            { id: 'kbps', label: 'Kbps' },
            { id: 'dual', label: 'Dual' },
          ] as { id: SpeedUnit; label: string }[]).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelectUnit && onSelectUnit(u.id)}
              className={`px-2 py-0.5 rounded-full font-bold uppercase transition-all cursor-pointer ${
                speedUnit === u.id
                  ? 'bg-cyan-500 text-[#050510] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

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
              strokeDashoffset={outerProgressOffset}
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
        <div className="text-center z-10 flex flex-col items-center justify-center px-4 max-w-[280px]">
          {stage === 'idle' ? (
            /* Idle Screen */
            <div className="flex flex-col items-center">
              <div className="text-5xl sm:text-6xl font-black italic tracking-tighter text-white mb-[-4px] leading-none">
                0.0
              </div>
              <div className="text-sm sm:text-base font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">
                {speedUnit === 'kbps' ? 'Kbps' : 'Mbps'}
              </div>
              <div className="text-[10px] font-mono-tech text-slate-500 mb-4">
                {testDurationSeconds === 60 ? '1-Minute Wi-Fi Stress Test' : `${testDurationSeconds}s Benchmark`}
              </div>
              <button
                id="start-speed-test-btn"
                onClick={onStart}
                className="bg-white/5 border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-white px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Start Test
              </button>
            </div>
          ) : isTesting ? (
            /* Testing Active Throughput Screen */
            <div className="flex flex-col items-center">
              <div
                className={`font-black italic tracking-tighter text-white mb-[-6px] leading-none font-mono-tech tabular-nums drop-shadow-lg ${
                  speedUnit === 'kbps' ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-7xl'
                }`}
              >
                {primaryDisplaySpeed}
              </div>

              <div className={`text-base sm:text-lg font-bold ${meta.textColor} uppercase tracking-[0.2em] mt-1`}>
                {stage === 'ping' ? 'ms' : speedUnit === 'kbps' ? 'Kbps' : 'Mbps'}
              </div>

              {/* Dual Readout when speedUnit === 'dual' */}
              {speedUnit === 'dual' && stage !== 'ping' && (
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono-tech text-[10px] font-bold mt-1">
                  ⚡ {secondaryKbpsVal} Kbps
                </div>
              )}

              {/* Live Elapsed & Duration Counter */}
              <div className="text-[10px] font-mono-tech text-slate-400 mt-2 mb-3">
                Elapsed: <strong className="text-cyan-400">{Math.round(elapsedSeconds)}s</strong> / {testDurationSeconds}s
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="cancel-speed-test-btn"
                  onClick={onCancel}
                  className="bg-rose-500/10 border border-rose-500/30 hover:border-rose-400 text-rose-300 px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel Test
                </button>
              </div>
            </div>
          ) : (
            /* Completed Screen */
            <div className="flex flex-col items-center">
              <div
                className={`font-black italic tracking-tighter text-emerald-400 mb-[-6px] leading-none font-mono-tech tabular-nums drop-shadow-lg ${
                  speedUnit === 'kbps' ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-7xl'
                }`}
              >
                {primaryDisplaySpeed}
              </div>

              <div className="text-base sm:text-lg font-bold text-cyan-400 uppercase tracking-[0.2em] mt-1">
                {speedUnit === 'kbps' ? 'Kbps' : 'Mbps'}
              </div>

              {/* Dual Readout in Completed Screen */}
              {speedUnit === 'dual' && (
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono-tech text-[10px] font-bold mt-1">
                  ⚡ {secondaryKbpsVal} Kbps
                </div>
              )}

              <div className="text-[10px] font-mono-tech text-slate-400 mt-1 mb-3">
                {testDurationSeconds === 60 ? '1-Min Continuous Complete' : `${testDurationSeconds}s Test Complete`}
              </div>

              <button
                id="retest-speed-btn"
                onClick={onStart}
                className="bg-white/5 border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-white px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Restart Test
              </button>
            </div>
          )}
        </div>

        {/* Bottom Current Stage & Step Indicators */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-8 flex flex-col items-center">
          <div className="text-[10px] uppercase text-slate-400 tracking-[0.25em] font-bold font-mono-tech">
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
