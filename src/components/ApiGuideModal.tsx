import React, { useState } from 'react';
import { Check, Code, Copy, ExternalLink, HelpCircle, Layers, Server, X, Zap } from 'lucide-react';

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiGuideModal: React.FC<ApiGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const realPingSnippet = `// 1. Real Ping & Jitter measurement via HTTP HEAD/GET
async function measureRealPing(endpoint = '/api/ping', samples = 10): Promise<{ ping: number; jitter: number }> {
  const rtts: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    await fetch(\`\${endpoint}?_t=\${Date.now()}\`, { method: 'HEAD', cache: 'no-store' });
    const rtt = performance.now() - start;
    rtts.push(rtt);
    await new Promise(r => setTimeout(r, 60)); // Inter-packet gap
  }
  const avgPing = Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length);
  const diffs = rtts.slice(1).map((val, i) => Math.abs(val - rtts[i]));
  const avgJitter = Number((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1));
  return { ping: avgPing, jitter: avgJitter };
}`;

  const realDownloadSnippet = `// 2. Real Download measurement via ReadableStream chunks
async function measureRealDownload(
  chunkUrl = 'https://speed.cloudflare.com/__down?bytes=50000000',
  onProgress: (mbps: number) => void
): Promise<number> {
  const response = await fetch(chunkUrl);
  const reader = response.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported');

  let receivedBytes = 0;
  const startTime = performance.now();
  let lastTime = startTime;
  let lastBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.length;
    const now = performance.now();
    
    // Sample every 150ms
    if (now - lastTime > 150) {
      const deltaBytes = receivedBytes - lastBytes;
      const deltaTime = (now - lastTime) / 1000;
      const instantMbps = (deltaBytes * 8) / (deltaTime * 1e6);
      onProgress(Number(instantMbps.toFixed(1)));
      lastTime = now;
      lastBytes = receivedBytes;
    }
  }
  const totalDuration = (performance.now() - startTime) / 1000;
  return Number(((receivedBytes * 8) / (totalDuration * 1e6)).toFixed(1));
}`;

  const realUploadSnippet = `// 3. Real Upload measurement via POST Blob
async function measureRealUpload(
  uploadUrl = 'https://speed.cloudflare.com/__up',
  payloadSizeMB = 20,
  onProgress: (mbps: number) => void
): Promise<number> {
  const randomBytes = new Uint8Array(payloadSizeMB * 1024 * 1024);
  crypto.getRandomValues(randomBytes.subarray(0, 1024)); // Sparse entropy
  const blob = new Blob([randomBytes]);

  const start = performance.now();
  await fetch(uploadUrl, {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  const durationSec = (performance.now() - start) / 1000;
  const mbps = (payloadSizeMB * 8) / durationSec;
  return Number(mbps.toFixed(1));
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#0A0B1A] border border-white/10 shadow-2xl p-5 sm:p-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/5 text-cyan-400 border border-white/10">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">
              Real API Integration Architecture
            </h3>
            <p className="text-[11px] text-slate-400 font-mono-tech">
              Drop-in replacement recipes for LibreSpeed, Cloudflare Speed, or custom backend workers
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-mono-tech">
          {/* Explanation */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 leading-relaxed text-slate-300">
            <p>
              The application now features a <strong>Real-Time Live Network Engine</strong> connected directly to live backend endpoints (<code className="text-cyan-400">/api/ping</code>, <code className="text-cyan-400">/api/download</code>, and <code className="text-cyan-400">/api/upload</code>). When you click <strong>Start Test</strong>, real binary streams are transmitted over your active Wi-Fi / Ethernet link.
            </p>
          </div>

          {/* Snippet 1: Real Ping */}
          <div className="rounded-lg bg-[#050510] border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5">
              <span className="font-bold text-[11px] text-amber-400 uppercase tracking-wider">1. Ping & Jitter Real Measurement</span>
              <button
                onClick={() => handleCopy(realPingSnippet, 'ping')}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedTab === 'ping' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'ping' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] overflow-x-auto text-slate-300">
              <code>{realPingSnippet}</code>
            </pre>
          </div>

          {/* Snippet 2: Real Download */}
          <div className="rounded-lg bg-[#050510] border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5">
              <span className="font-bold text-[11px] text-cyan-400 uppercase tracking-wider">2. Download Stream Multi-Chunk</span>
              <button
                onClick={() => handleCopy(realDownloadSnippet, 'download')}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedTab === 'download' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'download' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] overflow-x-auto text-slate-300">
              <code>{realDownloadSnippet}</code>
            </pre>
          </div>

          {/* Snippet 3: Real Upload */}
          <div className="rounded-lg bg-[#050510] border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5">
              <span className="font-bold text-[11px] text-purple-400 uppercase tracking-wider">3. Upload Binary POST Payload</span>
              <button
                onClick={() => handleCopy(realUploadSnippet, 'upload')}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedTab === 'upload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'upload' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] overflow-x-auto text-slate-300">
              <code>{realUploadSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest font-mono-tech transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
