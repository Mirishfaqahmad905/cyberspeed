import React from 'react';
import { Code2, Globe2, Radio, Server, Sliders, ShieldCheck } from 'lucide-react';
import { ConnectionInfo, NetworkProfilePreset, ServerNode } from '../types';
import { PROFILE_CONFIGS, SERVERS } from '../utils/speedEngine';

interface NetworkConfigBarProps {
  selectedServer: ServerNode;
  onSelectServer: (server: ServerNode) => void;
  preset: NetworkProfilePreset;
  onSelectPreset: (preset: NetworkProfilePreset) => void;
  connection: ConnectionInfo;
  disabled: boolean;
  onOpenApiGuide: () => void;
}

export const NetworkConfigBar: React.FC<NetworkConfigBarProps> = ({
  selectedServer,
  onSelectServer,
  preset,
  onSelectPreset,
  connection,
  disabled,
  onOpenApiGuide,
}) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-[#0A0B1A] border border-white/5 text-xs font-mono-tech">
      {/* 1. Server Selector */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
        <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Server className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
            Test Server Node
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
                {s.flag} {s.name} ({s.city}) ~{s.basePingMs}ms
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Simulation Network Preset */}
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

      {/* 3. Connection & API Blueprint Button */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider truncate">
              Client ISP
            </span>
            <span className="text-slate-300 text-xs font-semibold truncate block" title={`${connection.isp} (${connection.ip})`}>
              {connection.isp}
            </span>
          </div>
        </div>

        <button
          id="api-blueprint-guide-btn"
          onClick={onOpenApiGuide}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          title="View how to replace simulation with real backend API"
        >
          <Code2 className="w-3 h-3" />
          <span>API</span>
        </button>
      </div>
    </div>
  );
};
