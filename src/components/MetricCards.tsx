import React from 'react';
import { Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { SpeedUnit, TestStage } from '../types';

interface MetricCardsProps {
  stage: TestStage;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  ping: number;
  jitter: number;
  peakDownload: number;
  peakUpload: number;
  speedUnit?: SpeedUnit;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  stage,
  downloadSpeed,
  uploadSpeed,
  ping,
  jitter,
  peakDownload,
  peakUpload,
  speedUnit = 'dual',
}) => {
  // Download values
  const downloadDisplay =
    downloadSpeed > 0
      ? speedUnit === 'kbps'
        ? Math.round(downloadSpeed * 1000).toLocaleString()
        : downloadSpeed.toFixed(1)
      : '--';

  const downloadKbps = downloadSpeed > 0 ? Math.round(downloadSpeed * 1000).toLocaleString() : null;

  // Upload values
  const uploadDisplay =
    uploadSpeed > 0
      ? speedUnit === 'kbps'
        ? Math.round(uploadSpeed * 1000).toLocaleString()
        : uploadSpeed.toFixed(1)
      : '--';

  const uploadKbps = uploadSpeed > 0 ? Math.round(uploadSpeed * 1000).toLocaleString() : null;

  const unitLabel = speedUnit === 'kbps' ? 'Kbps' : 'Mbps';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* 1. PING / LATENCY */}
      <div
        className={`bg-[#0A0B1A] border p-4 rounded-xl flex flex-col justify-between transition-all duration-300 ${
          stage === 'ping'
            ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-tech">
            Latency (Ping)
          </span>
          <div
            className={`p-1.5 rounded-lg border ${
              stage === 'ping'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic tracking-tight text-white font-mono-tech tabular-nums">
              {ping > 0 ? ping : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono-tech">
              ms
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500 border-t border-white/[0.04] pt-2">
          <span>{ping > 0 ? (ping < 20 ? 'Ultra Fast' : 'Normal') : 'Standby'}</span>
          <span className="text-slate-400">RTT</span>
        </div>
      </div>

      {/* 2. JITTER */}
      <div
        className={`bg-[#0A0B1A] border p-4 rounded-xl flex flex-col justify-between transition-all duration-300 ${
          stage === 'ping'
            ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-tech">
            Jitter
          </span>
          <div
            className={`p-1.5 rounded-lg border ${
              stage === 'ping'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic tracking-tight text-white font-mono-tech tabular-nums">
              {jitter > 0 ? jitter.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono-tech">
              ms
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500 border-t border-white/[0.04] pt-2">
          <span>{jitter > 0 ? (jitter < 3 ? 'Stable' : 'Fluctuating') : 'Standby'}</span>
          <span className="text-slate-400">Variance</span>
        </div>
      </div>

      {/* 3. DOWNLOAD SPEED */}
      <div
        className={`bg-[#0A0B1A] border p-4 rounded-xl flex flex-col justify-between transition-all duration-300 ${
          stage === 'download'
            ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-tech">
            Download
          </span>
          <div
            className={`p-1.5 rounded-lg border ${
              stage === 'download'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/5'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic tracking-tight text-cyan-300 font-mono-tech tabular-nums">
              {downloadDisplay}
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono-tech">
              {unitLabel}
            </span>
          </div>
          {speedUnit === 'dual' && downloadKbps && (
            <span className="text-[10px] font-mono-tech text-cyan-400/80 block mt-0.5">
              ≈ {downloadKbps} Kbps
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500 border-t border-white/[0.04] pt-2">
          <span>Peak: {peakDownload > 0 ? `${peakDownload.toFixed(1)} Mbps` : '--'}</span>
          <span className="text-cyan-400">Multi-Stream</span>
        </div>
      </div>

      {/* 4. UPLOAD SPEED */}
      <div
        className={`bg-[#0A0B1A] border p-4 rounded-xl flex flex-col justify-between transition-all duration-300 ${
          stage === 'upload'
            ? 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-tech">
            Upload
          </span>
          <div
            className={`p-1.5 rounded-lg border ${
              stage === 'upload'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/5'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic tracking-tight text-purple-300 font-mono-tech tabular-nums">
              {uploadDisplay}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono-tech">
              {unitLabel}
            </span>
          </div>
          {speedUnit === 'dual' && uploadKbps && (
            <span className="text-[10px] font-mono-tech text-purple-400/80 block mt-0.5">
              ≈ {uploadKbps} Kbps
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500 border-t border-white/[0.04] pt-2">
          <span>Peak: {peakUpload > 0 ? `${peakUpload.toFixed(1)} Mbps` : '--'}</span>
          <span className="text-purple-400">Payload Chunk</span>
        </div>
      </div>
    </div>
  );
};
