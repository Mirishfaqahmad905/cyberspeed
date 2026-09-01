import React from 'react';
import { Activity, Globe2, Radio, Server, ShieldCheck, Zap } from 'lucide-react';
import { ConnectionInfo, NetworkProfilePreset, ServerNode, TestMode } from '../types';
import { PROFILE_CONFIGS, SERVERS } from '../utils/speedEngine';

interface NetworkConfigBarProps {
  testMode: TestMode;
  onSelectTestMode: (mode: TestMode) => void;
  selectedServer: ServerNode;
  onSelectServer: (server: ServerNode) => void;
  preset: NetworkProfilePreset;
  onSelectPreset: (preset: NetworkProfilePreset) => void;
  connection: ConnectionInfo;
  disabled: boolean;
  onOpenApiGuide: () => void;
}

export const NetworkConfigBar: React.FC<NetworkConfigBarProps> = ({
  testMode,
  onSelectTestMode,
  selectedServer,
  onSelectServer,
  preset,
  onSelectPreset,
  connection,
  disabled,
  onOpenApiGuide,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Test Mode Selector Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-xl bg-[#0A0B1A] border border-white/5 font-mono-tech text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pl-2">
            Benchmark Mode:
          </span>
          <div className="inline-flex rounded-lg p-1 bg-white/[0.03] border border-white/5">
            <button
              id="mode-live-network-btn"
              onClick={() => onSelectTestMode('live_network')}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                testMode === 'live_network'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              } disabled:opacity-50`}
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Real Live Wi-Fi / Wire</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-500/30 text-emerald-300 font-black">
                REAL
              </span>
            </button>

            <button
              id="mode-simulated-btn"
              onClick={() => onSelectTestMode('simulated')}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                testMode === 'simulated'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              } disabled:opacity-50`}
            >
              <Radio className="w-3 h-3 text-purple-400" />
              <span>Simulated Profiles</span>
            </button>
          </div>
        </div>

        {/* Live Active Status Badge */}
        <div className="flex items-center gap-2 pr-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">
            {testMode === 'live_network' ? 'Direct socket stream active' : 'Preset profiles loaded'}
          </span>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-[#0A0B1A] border border-white/5 text-xs font-mono-tech">
        {/* 1. Server Selector */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              {testMode === 'live_network' ? 'Active Test Target' : 'Simulated Node'}
            </span>
            <select
              id="server-node-select"
              value={selectedServer.id}
              onChange={(e) => {
                const found = SERVERS.find((s) => s.id === e.target.value);
                if (found) onSelectServer(found);
              }}
              disabled={disabled}
              className="w-full bg-transparent text-slate-200 text-xs font-semibold focus:outline-none focus:text-cyan-300 cursor-pointer disabled:opacity-50"
            >
              {SERVERS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0A0B1A] text-slate-200">
                  {s.flag} {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Network Tier Preset (or Live Connection Info) */}
        {testMode === 'simulated' ? (
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                Network Tier Preset
              </span>
              <select
                id="network-preset-select"
                value={preset}
                onChange={(e) => onSelectPreset(e.target.value as NetworkProfilePreset)}
                disabled={disabled}
                className="w-full bg-transparent text-slate-200 text-xs font-semibold focus:outline-none focus:text-purple-300 cursor-pointer disabled:opacity-50"
              >
                {(Object.keys(PROFILE_CONFIGS) as NetworkProfilePreset[]).map((key) => (
                  <option key={key} value={key} className="bg-[#0A0B1A] text-slate-200">
                    {PROFILE_CONFIGS[key].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                Detected User Connection
              </span>
              <span className="text-slate-200 text-xs font-semibold truncate block">
                {connection.clientType} • {connection.city}
              </span>
            </div>
          </div>
        )}

        {/* 3. Connection Details & Protocol */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider truncate">
                Client IP / Protocol
              </span>
              <span className="text-slate-300 text-xs font-semibold truncate block" title={`${connection.isp} (${connection.ip})`}>
                {connection.ip}
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 uppercase tracking-wider">
            {testMode === 'live_network' ? 'LIVE' : 'SIM'}
          </span>
        </div>
      </div>
    </div>
  );
};
