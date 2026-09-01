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
  LayoutGrid,
  Lock,
} from 'lucide-react';
import { AdSlotBanner } from './components/AdSlotBanner';
import { AdminAdsModal } from './components/AdminAdsModal';
import { ApiGuideModal } from './components/ApiGuideModal';
import { HistoryTable } from './components/HistoryTable';
import { MetricCards } from './components/MetricCards';
import { NetworkConfigBar } from './components/NetworkConfigBar';
import { ResultSummaryCard } from './components/ResultSummaryCard';
import { SpeedGauge } from './components/SpeedGauge';
import { SpeedNotificationBar } from './components/SpeedNotificationBar';
import { TelemetryGraph } from './components/TelemetryGraph';
import { useAds } from './hooks/useAds';
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
    testMode,
    setTestMode,
    speedUnit,
    setSpeedUnit,
    testDurationSeconds,
    setTestDurationSeconds,
    startTest,
    cancelTest,
  } = useSpeedTest();

  // Ad system hook
  const { getAdForPlacement, trackImpression, trackClick, refreshAds } = useAds();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
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
                  1-MIN WI-FI CORE
                </span>
              </div>
              <span className="text-[10px] font-mono-tech text-slate-500 block -mt-0.5 tracking-wider uppercase">
                Real-Time Dual Bandwidth Measurement (Kbps & Mbps)
              </span>
            </div>
          </div>

          {/* Quick Node & Action Controls */}
          <div className="flex items-center gap-2.5 text-xs font-mono-tech">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
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
                {isTesting ? 'MEASURING WI-FI' : 'WI-FI ONLINE'}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-400 text-[11px]">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>{connection.city || selectedServer.city}</span>
            </div>

            {/* Admin Ads Panel Button */}
            <button
              id="header-admin-ads-btn"
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider shadow-sm"
              title="Manage Ad Spaces & Campaigns (User: ishfaqahmad)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ad Spaces</span>
              <span className="px-1 py-0.2 rounded bg-cyan-400 text-[#050510] text-[8px] font-black">
                ADMIN
              </span>
            </button>

            <button
              id="header-api-guide-btn"
              onClick={() => setIsApiGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 flex-1">
        {/* AD SLOT 1: Header Top Banner */}
        <div className="w-full">
          <AdSlotBanner
            placement="header_top"
            ad={getAdForPlacement('header_top')}
            onImpression={trackImpression}
            onClick={trackClick}
            className="mb-2"
          />
        </div>

        {/* Live Status Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-xs font-mono-tech">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Status:</span>
            <span className="text-white font-medium truncate">{state.statusMessage}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <span className="hidden sm:inline text-slate-500 uppercase text-[10px] font-bold tracking-wider">Duration:</span>
            <span className="text-cyan-400 font-bold text-[11px]">
              {testDurationSeconds === 60 ? '1 Minute (Continuous)' : `${testDurationSeconds} Seconds`}
            </span>
          </div>
        </div>

        {/* Hero Section: Interactive Gauge & Real-time Live Counters */}
        <div className="flex flex-col items-center justify-center pt-2 pb-1">
          <SpeedGauge
            stage={state.stage}
            currentSpeed={state.currentSpeed}
            downloadSpeed={state.downloadSpeed}
            uploadSpeed={state.uploadSpeed}
            progress={state.progress}
            speedUnit={speedUnit}
            testDurationSeconds={testDurationSeconds}
            elapsedSeconds={state.elapsedSeconds}
            onSelectUnit={setSpeedUnit}
            onSelectDuration={setTestDurationSeconds}
            onStart={handleStartNewTest}
            onCancel={cancelTest}
          />

          {/* AD SLOT 2: Under Gauge Banner */}
          <div className="w-full max-w-xl mt-4">
            <AdSlotBanner
              placement="under_gauge"
              ad={getAdForPlacement('under_gauge')}
              onImpression={trackImpression}
              onClick={trackClick}
            />
          </div>
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
            speedUnit={speedUnit}
          />
        </div>

        {/* Real-Time Bandwidth Waveform (Line Graph) + Sidebar Ad in responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-3">
            <TelemetryGraph
              dataPoints={state.dataPoints}
              stage={state.stage}
              currentSpeed={state.currentSpeed}
              peakDownload={state.peakDownload}
              peakUpload={state.peakUpload}
            />
          </div>

          {/* AD SLOT 3: Sidebar Right Ad */}
          <div className="lg:col-span-1 flex flex-col justify-center h-full">
            <AdSlotBanner
              placement="sidebar_right"
              ad={getAdForPlacement('sidebar_right')}
              onImpression={trackImpression}
              onClick={trackClick}
            />
          </div>
        </div>

        {/* AD SLOT 4: Above Results */}
        <div className="w-full">
          <AdSlotBanner
            placement="above_results"
            ad={getAdForPlacement('above_results')}
            onImpression={trackImpression}
            onClick={trackClick}
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
                  : 'Live Wi-Fi Benchmark Summary'}
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
              speedUnit={speedUnit}
              onRetest={handleStartNewTest}
            />
          </div>
        )}

        {/* Network Preset, Server Node & Connection Config Bar */}
        <div className="w-full">
          <NetworkConfigBar
            testMode={testMode}
            onSelectTestMode={(m) => {
              setTestMode(m);
              setSelectedHistoricalResult(null);
            }}
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
            speedUnit={speedUnit}
            onSelectResult={(res) => setSelectedHistoricalResult(res)}
          />
        </div>

        {/* AD SLOT 5: Footer Bottom Banner */}
        <div className="w-full pt-2">
          <AdSlotBanner
            placement="footer_bottom"
            ad={getAdForPlacement('footer_bottom')}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="w-full border-t border-white/5 bg-[#050510]/90 py-5 mt-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>CyberSpeed Core • 1-Minute Continuous Wi-Fi Measurement (Kbps & Mbps)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              id="footer-admin-ads-link"
              onClick={() => setIsAdminModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Ad Portal (ishfaqahmad)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsApiGuideOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Developer Docs
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Speed Result Notification Bar (Dual Kbps & Mbps Popup) */}
      <SpeedNotificationBar
        result={displayResult}
        stage={state.stage}
        currentSpeed={state.currentSpeed}
        onRetest={handleStartNewTest}
      />

      {/* Admin Ad Management Modal */}
      <AdminAdsModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          refreshAds();
        }}
      />

      {/* API Integration Guide Modal */}
      <ApiGuideModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
      />
    </div>
  );
}
