import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Code2,
  Cpu,
  Globe2,
  History,
  Info,
  Layers,
  Play,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { ApiGuideModal } from './components/ApiGuideModal';
import { HistoryTable } from './components/HistoryTable';
import { MetricCards } from './components/MetricCards';
import { NetworkConfigBar } from './components/NetworkConfigBar';
import { ResultSummaryCard } from './components/ResultSummaryCard';
import { SpeedGauge } from './components/SpeedGauge';
import { TelemetryGraph } from './components/TelemetryGraph';
import { useSpeedTest } from './hooks/useSpeedTest';
import { SpeedTestResult } from './types';

export default function App() {
  const {
    state,
    selectedServer,
    setSelectedServer,
    connection,
    preset,
    setPreset,
    startTest,
    cancelTest,
  } = useSpeedTest();

  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false);
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState<SpeedTestResult | null>(null);

  const isTesting = state.stage === 'ping' || state.stage === 'download' || state.stage === 'upload';
  const displayResult = selectedHistoricalResult || state.activeResult;

  const handleStartNewTest = () => {
    setSelectedHistoricalResult(null);
    startTest();
  };

  return (
    <div className="min-h-screen bg-[#050510] text-slate-100 cyber-grid relative overflow-x-hidden flex flex-col justify-between">
      {/* Background ambient radial neon lights */}
      <div className="fixed inset-0 cyber-radial pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Cyber Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#050510] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-black tracking-wider text-white">
                  CYBER<span className="text-cyan-400">SPEED</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-tech font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                  v2.4 PRO
                </span>
              </div>
              <span className="text-[10px] font-mono-tech text-slate-500 block -mt-0.5 tracking-wider uppercase">
                Gigabit Telemetry Benchmark
              </span>
            </div>
          </div>

          {/* Quick Node & Status Ticker */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono-tech">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isTesting ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isTesting ? 'bg-cyan-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                {isTesting ? 'ACTIVE BENCHMARK' : 'SOCKET READY'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-400 text-[11px]">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedServer.city}</span>
            </div>

            <button
              id="header-api-guide-btn"
              onClick={() => setIsApiGuideOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>API Integration</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1">
        {/* Status Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-xs font-mono-tech">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Status:</span>
            <span className="text-white font-medium truncate">{state.statusMessage}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <span className="hidden sm:inline text-slate-500 uppercase text-[10px] font-bold tracking-wider">Engine:</span>
            <span className="text-cyan-400 font-bold text-[11px]">WebSockets / Streams Simulation</span>
          </div>
        </div>

        {/* Hero Section: Interactive Gauge & Real-time Live Counters */}
        <div className="flex flex-col items-center justify-center pt-2 pb-2">
          <SpeedGauge
            stage={state.stage}
            currentSpeed={state.currentSpeed}
            downloadSpeed={state.downloadSpeed}
            uploadSpeed={state.uploadSpeed}
            progress={state.progress}
            onStart={handleStartNewTest}
            onCancel={cancelTest}
          />
        </div>

        {/* Real-time Telemetry Dashboard (4 Key Metric Cards) */}
        <div className="w-full">
          <MetricCards
            stage={state.stage}
            downloadSpeed={state.downloadSpeed}
            uploadSpeed={state.uploadSpeed}
            ping={state.ping}
            jitter={state.jitter}
            peakDownload={state.peakDownload}
            peakUpload={state.peakUpload}
          />
        </div>

        {/* Real-Time Bandwidth Waveform (Line Graph) */}
        <div className="w-full">
          <TelemetryGraph
            dataPoints={state.dataPoints}
            stage={state.stage}
            currentSpeed={state.currentSpeed}
            peakDownload={state.peakDownload}
            peakUpload={state.peakUpload}
          />
        </div>

        {/* Result Summary Card (Displayed upon completion or history selection) */}
        {displayResult && (
          <div className="w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-tech text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {selectedHistoricalResult
                  ? `Viewing Historical Benchmark (${new Date(
                      selectedHistoricalResult.timestamp
                    ).toLocaleTimeString()})`
                  : 'Benchmark Verified Summary'}
              </span>
              {selectedHistoricalResult && (
                <button
                  onClick={() => setSelectedHistoricalResult(null)}
                  className="text-xs font-mono-tech text-cyan-400 hover:underline cursor-pointer"
                >
                  Return to current test
                </button>
              )}
            </div>
            <ResultSummaryCard
              result={displayResult}
              onRetest={handleStartNewTest}
            />
          </div>
        )}

        {/* Network Preset, Server Node & Connection Config Bar */}
        <div className="w-full">
          <NetworkConfigBar
            selectedServer={selectedServer}
            onSelectServer={(server) => {
              setSelectedServer(server);
              setSelectedHistoricalResult(null);
            }}
            preset={preset}
            onSelectPreset={(p) => {
              setPreset(p);
              setSelectedHistoricalResult(null);
            }}
            connection={connection}
            disabled={isTesting}
            onOpenApiGuide={() => setIsApiGuideOpen(true)}
          />
        </div>

        {/* Historical Test Results Table (localStorage) */}
        <div className="w-full">
          <HistoryTable
            lastUpdated={state.activeResult ? state.activeResult.timestamp : 0}
            onSelectResult={(res) => setSelectedHistoricalResult(res)}
          />
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="w-full border-t border-white/5 bg-[#050510]/90 py-5 mt-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>CyberSpeed Telemetry Core • Zero-Telemetry Logging</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Compliant with RFC 6349 TCP Throughput Standards</span>
            <span>•</span>
            <button
              onClick={() => setIsApiGuideOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Developer Docs
            </button>
          </div>
        </div>
      </footer>

      {/* API Integration Guide Modal */}
      <ApiGuideModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
      />
    </div>
  );
}
