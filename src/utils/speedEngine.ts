import { ConnectionInfo, DataPoint, NetworkProfilePreset, PerformanceRating, ServerNode, SpeedTestResult } from '../types';

export const SERVERS: ServerNode[] = [
  {
    id: 'live-local',
    name: 'Direct Live Wire (Nearest Edge)',
    sponsor: 'Active Client Socket / Real Telemetry',
    city: 'Nearest Active Node',
    country: 'Live Link',
    flag: '⚡',
    distanceKm: 2,
    basePingMs: 2,
    isRealLocalServer: true,
  },
  {
    id: 'edge-sfo',
    name: 'San Francisco Edge-01',
    sponsor: 'Cloudflare / Fastly Mesh',
    city: 'San Francisco, CA',
    country: 'United States',
    flag: '🇺🇸',
    distanceKm: 18,
    basePingMs: 9,
  },
  {
    id: 'edge-nyc',
    name: 'New York Metro Edge',
    sponsor: 'Equinix NY5 Datacenter',
    city: 'New York, NY',
    country: 'United States',
    flag: '🇺🇸',
    distanceKm: 4120,
    basePingMs: 38,
  },
  {
    id: 'edge-lon',
    name: 'London Docklands Core',
    sponsor: 'Telehouse North IX',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    distanceKm: 8640,
    basePingMs: 72,
  },
  {
    id: 'edge-fra',
    name: 'Frankfurt DE-CIX Main',
    sponsor: 'Interxion Campus FRA1',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    distanceKm: 9150,
    basePingMs: 84,
  },
  {
    id: 'edge-tyo',
    name: 'Tokyo Bay Tier-IV',
    sponsor: 'NTT Comms / JPIX',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    distanceKm: 8280,
    basePingMs: 96,
  },
  {
    id: 'edge-sin',
    name: 'Singapore Jurong Hub',
    sponsor: 'Singtel Megalink IX',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    distanceKm: 13600,
    basePingMs: 145,
  },
];

export const DEFAULT_CONNECTION: ConnectionInfo = {
  ip: 'Detecting live IP...',
  isp: 'Active Local Wi-Fi / Broadband',
  protocol: 'HTTPS / TLS 1.3',
  city: 'Detected Location',
  country: 'Live Online',
  clientType: 'Wi-Fi / Ethernet Connection',
  isLiveDetected: false,
};

export interface ProfileConfig {
  name: string;
  targetDownload: number;
  targetUpload: number;
  targetPing: number;
  targetJitter: number;
  jitterVariance: number;
}

export const PROFILE_CONFIGS: Record<NetworkProfilePreset, ProfileConfig> = {
  gigabit_fiber: {
    name: 'Gigabit Fiber (1 Gbps)',
    targetDownload: 920,
    targetUpload: 880,
    targetPing: 6,
    targetJitter: 1.2,
    jitterVariance: 0.8,
  },
  fast_cable: {
    name: 'High-Speed Cable (400 Mbps)',
    targetDownload: 410,
    targetUpload: 45,
    targetPing: 18,
    targetJitter: 3.5,
    jitterVariance: 2.1,
  },
  standard_5g: {
    name: '5G Ultra Wideband (250 Mbps)',
    targetDownload: 265,
    targetUpload: 68,
    targetPing: 24,
    targetJitter: 5.8,
    jitterVariance: 3.4,
  },
  dsl_moderate: {
    name: 'Standard Broadband (60 Mbps)',
    targetDownload: 58,
    targetUpload: 14,
    targetPing: 34,
    targetJitter: 7.2,
    jitterVariance: 4.5,
  },
  unstable_mobile: {
    name: 'Fluctuating 4G/LTE (25 Mbps)',
    targetDownload: 24,
    targetUpload: 6.5,
    targetPing: 68,
    targetJitter: 18.5,
    jitterVariance: 12.0,
  },
};

/**
 * Calculates a benchmark performance rating based on standard broadband metrics.
 */
export function calculateGrade(
  download: number,
  upload: number,
  ping: number,
  jitter: number
): PerformanceRating {
  // Score formula weighting: 50% download, 20% upload, 20% ping, 10% jitter
  let score = 0;

  // Download score (max 50 pts)
  if (download >= 500) score += 50;
  else if (download >= 200) score += 42;
  else if (download >= 100) score += 35;
  else if (download >= 50) score += 28;
  else if (download >= 20) score += 18;
  else score += Math.max(5, (download / 20) * 15);

  // Upload score (max 20 pts)
  if (upload >= 200) score += 20;
  else if (upload >= 50) score += 17;
  else if (upload >= 20) score += 14;
  else if (upload >= 10) score += 10;
  else score += Math.max(2, (upload / 10) * 8);

  // Ping score (max 20 pts)
  if (ping <= 12) score += 20;
  else if (ping <= 25) score += 16;
  else if (ping <= 50) score += 12;
  else if (ping <= 90) score += 7;
  else score += 3;

  // Jitter score (max 10 pts)
  if (jitter <= 2.5) score += 10;
  else if (jitter <= 6) score += 8;
  else if (jitter <= 12) score += 5;
  else score += 2;

  if (score >= 88) {
    return {
      grade: 'S',
      title: 'Godlike / Ultra-Broadband',
      badgeColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20',
      description: 'Zero bottleneck. Exceptional for competitive eSports, 8K streaming, instantaneous cloud backups, and VR streaming.',
      gaming: 'S-Tier (Competitive)',
      streaming: '8K Ultra HD',
      videoCalls: 'Flawless 4K Conference',
      largeDownloads: 'Instant (< 1 min)',
    };
  } else if (score >= 72) {
    return {
      grade: 'A',
      title: 'Excellent / Pro High-Speed',
      badgeColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/20',
      description: 'Superb reliability. Supports multi-device 4K streaming, smooth low-latency gaming, and ultra-fast file downloads.',
      gaming: 'Great',
      streaming: '4K UHD Multiple',
      videoCalls: 'Smooth HD Calls',
      largeDownloads: 'Fast (1-3 min)',
    };
  } else if (score >= 52) {
    return {
      grade: 'B',
      title: 'Good / Standard Modern',
      badgeColor: 'text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-blue-500/20',
      description: 'Solid everyday performance. Smooth HD video conferencing, casual online gaming, and comfortable home streaming.',
      gaming: 'Acceptable',
      streaming: '1080p Full HD',
      videoCalls: 'Smooth HD Calls',
      largeDownloads: 'Moderate (5-15 min)',
    };
  } else if (score >= 35) {
    return {
      grade: 'C',
      title: 'Fair / Basic Household',
      badgeColor: 'text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-amber-500/20',
      description: 'Adequate for single-device web browsing, music, and 1080p video. May experience buffering during heavy concurrent usage.',
      gaming: 'Acceptable',
      streaming: '1080p Full HD',
      videoCalls: 'Occasional Stutter',
      largeDownloads: 'Moderate (5-15 min)',
    };
  } else {
    return {
      grade: 'D',
      title: 'Poor / High Latency Bottleneck',
      badgeColor: 'text-rose-400 border-rose-500/50 bg-rose-500/10 shadow-rose-500/20',
      description: 'Noticeable lag and slow download speeds. Consider power-cycling router, switching from 2.4GHz Wi-Fi to Ethernet, or checking ISP service.',
      gaming: 'Poor (Laggy)',
      streaming: '720p HD Only',
      videoCalls: 'Video Dropouts',
      largeDownloads: 'Slow (> 30 min)',
    };
  }
}

/**
 * Storage helpers for last 5 test results
 */
const STORAGE_KEY = 'cyberspeed_history_v1';

export function getStoredHistory(): SpeedTestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch (e) {
    console.error('Failed to load speed test history from localStorage', e);
    return [];
  }
}

export function saveResultToHistory(result: SpeedTestResult): SpeedTestResult[] {
  try {
    const current = getStoredHistory();
    const updated = [result, ...current.filter((r) => r.id !== result.id)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save speed test history to localStorage', e);
    return [];
  }
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear speed test history', e);
  }
}

/**
 * Real API Integration Guide (Pluggable Architecture)
 * ===================================================
 * 
 * To plug in a real network backend (e.g. LibreSpeed self-hosted worker,
 * Cloudflare speed test worker, or custom HTTP chunk streamer):
 * 
 * 1. PING & JITTER:
 *    Make 10 sequential lightweight HTTP HEAD or GET requests (e.g. `/api/ping` or `fetch('/favicon.ico?t=' + Date.now())`).
 *    Measure `performance.now() - start` for each roundtrip.
 *    `ping` = average(rtt)
 *    `jitter` = average(|rtt[i] - rtt[i-1]|)
 * 
 * 2. DOWNLOAD:
 *    Fetch a large binary payload (e.g., 25MB-100MB chunk stream) across multiple concurrent connections.
 *    Use `response.body.getReader()` to count total bytes received over time windows `deltaBytes / deltaTime * 8 / 1e6` to yield instantaneous Mbps.
 * 
 * 3. UPLOAD:
 *    POST a generated `ArrayBuffer` or `Blob` of random bytes (e.g., 10MB-40MB) using `fetch(uploadUrl, { method: 'POST', body: randomBlob })` or `XMLHttpRequest.upload.onprogress`.
 *    Calculate bytes uploaded over time interval.
 */
