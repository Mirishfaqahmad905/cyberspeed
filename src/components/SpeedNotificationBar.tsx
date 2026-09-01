import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Gauge,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { SpeedTestResult, TestStage } from '../types';

interface SpeedNotificationBarProps {
  result: SpeedTestResult | null;
  stage: TestStage;
  currentSpeed: number;
  onRetest: () => void;
  onScrollToReport?: () => void;
}

export const SpeedNotificationBar: React.FC<SpeedNotificationBarProps> = ({
  result,
  stage,
  currentSpeed,
  onRetest,
  onScrollToReport,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNewResultAnim, setHasNewResultAnim] = useState(false);

  // Reset dismissed state when a test finishes
  useEffect(() => {
    if (stage === 'complete' && result) {
      setIsDismissed(false);
      setIsMinimized(false);
      setHasNewResultAnim(true);
      const timer = setTimeout(() => setHasNewResultAnim(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, result?.id]);

  if (!result || isDismissed) {
    return null;
  }

  const downloadMbps = result.downloadSpeed.toFixed(1);
  const downloadKbps = Math.round(result.downloadSpeed * 1000).toLocaleString();

  const uploadMbps = result.uploadSpeed.toFixed(1);
  const uploadKbps = Math.round(result.uploadSpeed * 1000).toLocaleString();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `⚡ CyberSpeed Verified Result:\n• Download: ${downloadMbps} Mbps (${downloadKbps} Kbps)\n• Upload: ${uploadMbps} Mbps (${uploadKbps} Kbps)\n• Ping: ${result.ping} ms | Jitter: ${result.jitter} ms\n• Grade: ${result.rating.grade} (${result.rating.title})\n• Duration: ${result.testDurationSeconds || 60}s\n• Server: ${result.server.name} (${result.server.city})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Minimized floating pill version
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 bg-[#0A0B1A]/95 border border-cyan-500/40 hover:border-cyan-400 px-3.5 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-xl cursor-pointer transition-all hover:scale-105"
          title="Click to expand Speed Result Notification Bar"
        >
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono-tech text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>↓ {downloadMbps} Mbps</span>
            <span className="text-[10px] text-cyan-300/80">({downloadKbps} Kbps)</span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-1.5 text-purple-400 font-mono-tech text-xs font-bold">
            <span>↑ {uploadMbps} Mbps</span>
            <span className="text-[10px] text-purple-300/80">({uploadKbps} Kbps)</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Popup / Notification Bar
  return (
    <div
      id="speed-result-notification-bar"
      className="fixed bottom-2 sm:bottom-4 inset-x-0 z-50 px-3 pointer-events-none transition-all duration-300"
    >
      <div className="max-w-5xl mx-auto w-full pointer-events-auto bg-[#0A0B1A]/95 border border-cyan-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_0_35px_rgba(6,182,212,0.3)] backdrop-blur-2xl relative overflow-hidden ring-1 ring-white/10 animate-pop-up">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 opacity-80" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Status & Grade info */}
          <div className="flex items-center gap-3">
            {/* Grade Circle Badge */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-display text-xl sm:text-2xl font-black border ${result.rating.badgeColor} shadow-md shrink-0`}
            >
              {result.rating.grade}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono-tech font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  Speed Test Complete
                </span>
                <span className="text-[10px] font-mono-tech text-slate-400">
                  {result.server.name} ({result.server.city})
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide mt-0.5">
                {result.rating.title}
              </h4>
            </div>
          </div>

          {/* Middle: BOTH Kbps and Mbps for Download and Upload */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-black/40 p-2 sm:p-2.5 rounded-xl border border-white/5 font-mono-tech">
            {/* Download Speed (Dual Unit) */}
            <div className="px-2 py-1 bg-white/[0.02] rounded-lg border border-cyan-500/20">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
                <ArrowDown className="w-3 h-3 text-cyan-400" />
                <span>Download</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black italic text-cyan-300 font-mono-tech">
                  {downloadMbps}
                </span>
                <span className="text-[10px] font-bold text-cyan-400">Mbps</span>
              </div>
              <div className="text-[10px] text-cyan-300/90 font-bold tracking-tight">
                ⚡ {downloadKbps} <span className="text-[8px] text-slate-400 font-normal">Kbps</span>
              </div>
            </div>

            {/* Upload Speed (Dual Unit) */}
            <div className="px-2 py-1 bg-white/[0.02] rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
                <ArrowUp className="w-3 h-3 text-purple-400" />
                <span>Upload</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black italic text-purple-300 font-mono-tech">
                  {uploadMbps}
                </span>
                <span className="text-[10px] font-bold text-purple-400">Mbps</span>
              </div>
              <div className="text-[10px] text-purple-300/90 font-bold tracking-tight">
                ⚡ {uploadKbps} <span className="text-[8px] text-slate-400 font-normal">Kbps</span>
              </div>
            </div>

            {/* Ping & Jitter */}
            <div className="col-span-2 sm:col-span-1 px-2 py-1 bg-white/[0.02] rounded-lg border border-amber-500/20 flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Latency / Jitter</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-200 font-bold">
                <span className="text-amber-300">{result.ping} ms</span>
                <span className="text-slate-500">/</span>
                <span className="text-amber-400/80">{result.jitter.toFixed(1)} ms</span>
              </div>
              <div className="text-[9px] text-slate-400">
                {result.ping < 20 ? 'Optimal Ping' : 'Normal Ping'}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* Copy Button */}
            <button
              id="notif-bar-copy-btn"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold font-mono-tech uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              title="Copy speed stats to clipboard"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>

            {/* Retest Button */}
            <button
              id="notif-bar-retest-btn"
              onClick={onRetest}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#050510] text-xs font-black font-mono-tech uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-cyan-500/30 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px]">Retest</span>
            </button>

            {/* Minimize Button */}
            <button
              id="notif-bar-minimize-btn"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Minimize notification bar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close / Dismiss Button */}
            <button
              id="notif-bar-close-btn"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
