import React, { useState } from 'react';
import { Award, CheckCircle2, Copy, Download, Gamepad2, Globe, MonitorPlay, RefreshCw, Share2, Sparkles, Video, Wifi, Clock } from 'lucide-react';
import { SpeedTestResult, SpeedUnit } from '../types';

interface ResultSummaryCardProps {
  result: SpeedTestResult;
  speedUnit?: SpeedUnit;
  onRetest: () => void;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({
  result,
  speedUnit = 'dual',
  onRetest,
}) => {
  const [copied, setCopied] = useState(false);

  const downloadKbps = Math.round(result.downloadSpeed * 1000).toLocaleString();
  const uploadKbps = Math.round(result.uploadSpeed * 1000).toLocaleString();

  const handleCopy = () => {
    const summaryText = `🚀 CyberSpeed Benchmark Results:\n• Download: ${result.downloadSpeed} Mbps (${downloadKbps} Kbps)\n• Upload: ${result.uploadSpeed} Mbps (${uploadKbps} Kbps)\n• Ping: ${result.ping} ms | Jitter: ${result.jitter} ms\n• Grade: ${result.rating.grade} (${result.rating.title})\n• Duration: ${result.testDurationSeconds || 60}s\n• Server: ${result.server.name} (${result.server.city})\n• Date: ${new Date(result.timestamp).toLocaleString()}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full rounded-xl bg-[#0A0B1A] border border-white/10 p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Grade Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl font-black border ${result.rating.badgeColor} shadow-lg`}
          >
            {result.rating.grade}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                {result.rating.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono-tech bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                {result.isRealTest !== false ? 'Live Wi-Fi Verified' : 'Simulated Preset'}
              </span>
              {result.testDurationSeconds && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono-tech bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{result.testDurationSeconds === 60 ? '1-Min Continuous' : `${result.testDurationSeconds}s`}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              {result.rating.description}
            </p>
            {result.totalBytesDownloaded && result.totalBytesDownloaded > 0 ? (
              <p className="text-[10px] text-cyan-400 font-mono-tech mt-1">
                Transferred: {(result.totalBytesDownloaded / (1024 * 1024)).toFixed(1)} MB downloaded • {result.totalBytesUploaded ? (result.totalBytesUploaded / (1024 * 1024)).toFixed(1) : '0'} MB uploaded
              </p>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            id="copy-results-summary-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            id="retest-from-summary-btn"
            onClick={onRetest}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-white text-xs font-bold tracking-widest uppercase transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retest</span>
          </button>
        </div>
      </div>

      {/* Main Metrics 4-Col Grid (With Dual Mbps + Kbps display) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-white/5">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            DOWNLOAD SPEED
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-cyan-400 font-mono-tech">
              {result.downloadSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">Mbps</span>
          </div>
          <span className="text-[10px] font-mono-tech text-cyan-300/80 block mt-0.5">
            {downloadKbps} Kbps
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            UPLOAD SPEED
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-purple-400 font-mono-tech">
              {result.uploadSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">Mbps</span>
          </div>
          <span className="text-[10px] font-mono-tech text-purple-300/80 block mt-0.5">
            {uploadKbps} Kbps
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            LATENCY (PING)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-amber-400 font-mono-tech">
              {result.ping}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">ms</span>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-400 block mt-0.5">
            {result.ping < 20 ? 'Optimal for Gaming' : 'Standard Latency'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            PACKET JITTER
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-amber-400 font-mono-tech">
              {result.jitter.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">ms</span>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-400 block mt-0.5">
            {result.jitter < 3 ? 'Ultra Stable' : 'Moderate Jitter'}
          </span>
        </div>
      </div>

      {/* Real-World Experience Capability Matrix */}
      <div className="pt-4">
        <h3 className="text-xs font-mono-tech uppercase font-bold text-slate-400 tracking-wider mb-3">
          Real-World Wi-Fi Capability Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech block">Online Gaming</span>
              <span className="font-bold text-slate-200">{result.rating.gaming}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
              <MonitorPlay className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech block">Video Streaming</span>
              <span className="font-bold text-slate-200">{result.rating.streaming}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech block">Conference Calls</span>
              <span className="font-bold text-slate-200">{result.rating.videoCalls}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech block">File Transfers</span>
              <span className="font-bold text-slate-200">{result.rating.largeDownloads}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
