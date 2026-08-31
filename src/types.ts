export type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'cancelled';

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface PerformanceRating {
  grade: PerformanceGrade;
  title: string;
  badgeColor: string;
  description: string;
  gaming: 'S-Tier (Competitive)' | 'Great' | 'Acceptable' | 'Poor (Laggy)';
  streaming: '8K Ultra HD' | '4K UHD Multiple' | '1080p Full HD' | '720p HD Only';
  videoCalls: 'Flawless 4K Conference' | 'Smooth HD Calls' | 'Occasional Stutter' | 'Video Dropouts';
  largeDownloads: 'Instant (< 1 min)' | 'Fast (1-3 min)' | 'Moderate (5-15 min)' | 'Slow (> 30 min)';
}

export interface ServerNode {
  id: string;
  name: string;
  sponsor: string;
  city: string;
  country: string;
  flag: string;
  distanceKm: number;
  basePingMs: number;
}

export interface ConnectionInfo {
  ip: string;
  isp: string;
  protocol: string;
  city: string;
  country: string;
  clientType: string;
}

export interface DataPoint {
  time: number; // in seconds from start of phase
  speed: number; // in Mbps
  stage: 'download' | 'upload';
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  peakDownload: number;
  peakUpload: number;
  server: ServerNode;
  connection: ConnectionInfo;
  rating: PerformanceRating;
}

export type NetworkProfilePreset = 'gigabit_fiber' | 'fast_cable' | 'standard_5g' | 'dsl_moderate' | 'unstable_mobile';
