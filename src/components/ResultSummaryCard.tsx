import React, { useState } from 'react';
import { Award, CheckCircle2, Copy, Download, Gamepad2, Globe, MonitorPlay, RefreshCw, Share2, Sparkles, Video, Wifi } from 'lucide-react';
import { SpeedTestResult } from '../types';

interface ResultSummaryCardProps {
  result: SpeedTestResult;
  onRetest: () => void;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({
  result,
  onRetest,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const summaryText = `🚀 CyberSpeed Benchmark Results:\n• Download: ${result.downloadSpeed} Mbps (Peak: ${result.peakDownload} Mbps)\n• Upload: ${result.uploadSpeed} Mbps\n• Ping: ${result.ping} ms | Jitter: ${result.jitter} ms\n• Grade: ${result.rating.grade} (${result.rating.title})\n• Server: ${result.server.name} (${result.server.city})\n• Date: ${new Date(result.timestamp).toLocaleString()}`;
    
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                {result.rating.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono-tech bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              {result.rating.description}
            </p>
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

      {/* Main Metrics 4-Col Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-white/5">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            DOWNLOAD
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-cyan-400 font-mono-tech">
              {result.downloadSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">Mbps</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech mt-1 block">
            Peak: {result.peakDownload.toFixed(1)} Mbps
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            UPLOAD
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-purple-400 font-mono-tech">
              {result.uploadSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">Mbps</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech mt-1 block">
            Peak: {result.peakUpload.toFixed(1)} Mbps
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            LATENCY / PING
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-amber-400 font-mono-tech">
              {result.ping}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech mt-1 block">
            {result.ping < 20 ? 'Optimal for Gaming' : 'Normal latency'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-mono-tech text-slate-400 block mb-1 uppercase tracking-wider">
            JITTER
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black italic text-amber-400 font-mono-tech">
              {result.jitter.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech mt-1 block">
            {result.jitter < 4 ? 'Minimal variance' : 'Slight jitter'}
          </span>
        </div>
      </div>

      {/* Practical Application Capability Breakdown */}
      <div className="pt-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-tech mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-World Broadband Suitability</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gaming */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Competitive Gaming
              </span>
              <span className="text-xs font-medium text-emerald-400 font-mono-tech">
                {result.rating.gaming}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Ping under {result.ping}ms ensures crisp hit registration.
              </span>
            </div>
          </div>

          {/* 4K/8K Streaming */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
              <MonitorPlay className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Video Streaming
              </span>
              <span className="text-xs font-medium text-cyan-400 font-mono-tech">
                {result.rating.streaming}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Bitrate supports multiple simultaneous 4K streams.
              </span>
            </div>
          </div>

          {/* Video Conferencing */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Video Conferencing
              </span>
              <span className="text-xs font-medium text-purple-400 font-mono-tech">
                {result.rating.videoCalls}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Crystal-clear HD meetings with low delay.
              </span>
            </div>
          </div>

          {/* Large Downloads */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                50GB File DL
              </span>
              <span className="text-xs font-medium text-blue-400 font-mono-tech">
                {result.rating.largeDownloads}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Estimated speed for high-volume payloads.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Server & Node Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tech text-slate-500">
        <div className="flex items-center gap-2">
          <span>Server:</span>
          <span className="text-slate-300 font-medium">
            {result.server.flag} {result.server.name} ({result.server.city})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>ISP: <strong className="text-slate-300">{result.connection.isp}</strong></span>
          <span>•</span>
          <span>IP: <strong className="text-slate-300">{result.connection.ip}</strong></span>
        </div>
      </div>
    </div>
  );
};
