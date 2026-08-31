import React, { useMemo } from 'react';
import { Activity, ArrowDown, ArrowUp, BarChart3 } from 'lucide-react';
import { DataPoint, TestStage } from '../types';

interface TelemetryGraphProps {
  dataPoints: DataPoint[];
  stage: TestStage;
  currentSpeed: number;
  peakDownload: number;
  peakUpload: number;
}

export const TelemetryGraph: React.FC<TelemetryGraphProps> = ({
  dataPoints,
  stage,
  currentSpeed,
  peakDownload,
  peakUpload,
}) => {
  const isTesting = stage === 'ping' || stage === 'download' || stage === 'upload';

  // Dimensions of SVG viewport
  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 25, bottom: 30, left: 45 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Compute domain bounds
  const { maxSpeed, pointsWithCoords, downloadPath, uploadPath, downloadArea, uploadArea, lastPoint } =
    useMemo(() => {
      if (dataPoints.length === 0) {
        return {
          maxSpeed: 100,
          pointsWithCoords: [],
          downloadPath: '',
          uploadPath: '',
          downloadArea: '',
          uploadArea: '',
          lastPoint: null,
        };
      }

      const speeds = dataPoints.map((p) => p.speed);
      const calculatedMax = Math.max(...speeds, peakDownload, peakUpload, 20);
      // Give a 15% headroom for aesthetic spacing
      const domainMax = Math.ceil(calculatedMax * 1.15);

      const maxTime = Math.max(dataPoints[dataPoints.length - 1]?.time || 1, 6);

      const mapped = dataPoints.map((dp) => {
        const x = padding.left + (dp.time / maxTime) * graphWidth;
        const y = padding.top + graphHeight - (dp.speed / domainMax) * graphHeight;
        return { ...dp, x, y };
      });

      // Split into download and upload segments
      const downloadPoints = mapped.filter((p) => p.stage === 'download');
      const uploadPoints = mapped.filter((p) => p.stage === 'upload');

      // Generate SVG path commands
      const createLinePath = (pts: typeof mapped) => {
        if (pts.length === 0) return '';
        return pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
      };

      const createAreaPath = (pts: typeof mapped) => {
        if (pts.length === 0) return '';
        const line = createLinePath(pts);
        const first = pts[0];
        const last = pts[pts.length - 1];
        const groundY = padding.top + graphHeight;
        return `${line} L ${last.x.toFixed(1)} ${groundY} L ${first.x.toFixed(1)} ${groundY} Z`;
      };

      return {
        maxSpeed: domainMax,
        pointsWithCoords: mapped,
        downloadPath: createLinePath(downloadPoints),
        uploadPath: createLinePath(uploadPoints),
        downloadArea: createAreaPath(downloadPoints),
        uploadArea: createAreaPath(uploadPoints),
        lastPoint: mapped[mapped.length - 1] || null,
      };
    }, [dataPoints, peakDownload, peakUpload]);

  // Y-axis grid ticks (0, 25%, 50%, 75%, 100%)
  const yTicks = [0, Math.round(maxSpeed * 0.33), Math.round(maxSpeed * 0.66), maxSpeed];

  return (
    <div className="relative w-full rounded-xl bg-[#0A0B1A] border border-white/5 p-4 backdrop-blur-md overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-cyan-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Real-Time Bandwidth Waveform
            </h3>
            <p className="text-[10px] text-slate-500 font-mono-tech">
              Continuous socket throughput telemetry (Mbps / Time)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono-tech">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-none bg-cyan-400" />
            <span>Download</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2 h-2 rounded-none bg-purple-400" />
            <span>Upload</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[600/180] min-h-[150px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Download gradient fill */}
            <linearGradient id="downloadAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Upload gradient fill */}
            <linearGradient id="uploadAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            {/* Line glow filter */}
            <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, idx) => {
            const yPos = padding.top + graphHeight - (tick / maxSpeed) * graphHeight;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? undefined : '2 4'}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Download Area & Line */}
          {downloadArea && (
            <path d={downloadArea} fill="url(#downloadAreaGrad)" className="transition-all duration-100" />
          )}
          {downloadPath && (
            <path
              d={downloadPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />
          )}

          {/* Upload Area & Line */}
          {uploadArea && (
            <path d={uploadArea} fill="url(#uploadAreaGrad)" className="transition-all duration-100" />
          )}
          {uploadPath && (
            <path
              d={uploadPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />
          )}

          {/* Active Lead Point Pulsing Beacon */}
          {isTesting && lastPoint && (
            <g transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
              <circle
                r="5"
                fill={lastPoint.stage === 'download' ? '#06b6d4' : '#a855f7'}
                className="animate-ping opacity-75"
              />
              <circle
                r="3"
                fill="#ffffff"
                stroke={lastPoint.stage === 'download' ? '#06b6d4' : '#a855f7'}
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Idle placeholder message if no points */}
          {dataPoints.length === 0 && (
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              <text
                textAnchor="middle"
                fill="#475569"
                fontSize="11"
                fontFamily="'Inter', sans-serif"
              >
                Waiting for benchmark trigger...
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Footer Metrics Peak Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-white/5 text-[11px] font-mono-tech">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500">Peak DL:</span>
          <span className="text-cyan-300 font-semibold">{peakDownload.toFixed(1)} Mbps</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500">Peak UL:</span>
          <span className="text-purple-300 font-semibold">{peakUpload.toFixed(1)} Mbps</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500">Samples:</span>
          <span className="text-slate-300 font-semibold">{dataPoints.length}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500">Protocol:</span>
          <span className="text-emerald-400 font-semibold">HTTP/3 QUIC</span>
        </div>
      </div>
    </div>
  );
};
