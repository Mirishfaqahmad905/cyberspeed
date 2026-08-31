import React, { useEffect, useState } from 'react';
import { Clock, History, Trash2, ArrowDown, ArrowUp, Activity, Check, Download } from 'lucide-react';
import { SpeedTestResult } from '../types';
import { clearStoredHistory, getStoredHistory } from '../utils/speedEngine';

interface HistoryTableProps {
  lastUpdated: number;
  onSelectResult?: (result: SpeedTestResult) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  lastUpdated,
  onSelectResult,
}) => {
  const [history, setHistory] = useState<SpeedTestResult[]>([]);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, [lastUpdated]);

  const handleClear = () => {
    clearStoredHistory();
    setHistory([]);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="w-full rounded-xl bg-[#0A0B1A] border border-white/5 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-purple-400">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Benchmark History
            </h3>
            <p className="text-[10px] text-slate-500 font-mono-tech">
              Last 5 speed tests saved to localStorage
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            title="Clear all stored test logs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-7 text-center border border-dashed border-white/10 rounded-lg">
          <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400 font-medium">No previous tests logged yet</p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Run a test to automatically log and compare your network speed history.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-[10px] tracking-wider uppercase font-bold">
                <th className="pb-2.5 pl-2">Grade</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Download</th>
                <th className="pb-2.5">Upload</th>
                <th className="pb-2.5">Ping / Jitter</th>
                <th className="pb-2.5">Server Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((item) => {
                const { date, time } = formatDate(item.timestamp);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectResult && onSelectResult(item)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    {/* Grade Pill */}
                    <td className="py-2.5 pl-2">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded font-black font-display text-[11px] border ${
                          item.rating.grade === 'S'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.rating.grade === 'A'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : item.rating.grade === 'B'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : item.rating.grade === 'C'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.rating.grade}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 text-slate-300">
                      <div className="flex flex-col">
                        <span>{date}</span>
                        <span className="text-[9px] text-slate-500">{time}</span>
                      </div>
                    </td>

                    {/* Download */}
                    <td className="py-2.5 font-bold text-cyan-400">
                      <div className="flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-cyan-500" />
                        <span>{item.downloadSpeed.toFixed(1)} Mbps</span>
                      </div>
                    </td>

                    {/* Upload */}
                    <td className="py-2.5 font-bold text-purple-400">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-purple-500" />
                        <span>{item.uploadSpeed.toFixed(1)} Mbps</span>
                      </div>
                    </td>

                    {/* Ping / Jitter */}
                    <td className="py-2.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-amber-500" />
                        <span>{item.ping} ms</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{item.jitter.toFixed(1)} ms</span>
                      </div>
                    </td>

                    {/* Server Node */}
                    <td className="py-2.5 text-slate-400 pr-2">
                      <span className="truncate max-w-[140px] block" title={item.server.name}>
                        {item.server.flag} {item.server.city}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
