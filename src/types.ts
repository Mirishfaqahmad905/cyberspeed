export type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'cancelled';

export type TestMode = 'live_network' | 'simulated';

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
  isRealLocalServer?: boolean;
}

export interface ConnectionInfo {
  ip: string;
  isp: string;
  protocol: string;
  city: string;
  country: string;
  clientType: string;
  isLiveDetected?: boolean;
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
  isRealTest?: boolean;
  totalBytesDownloaded?: number;
  totalBytesUploaded?: number;
  testDurationSeconds?: number;
}

export type NetworkProfilePreset = 'gigabit_fiber' | 'fast_cable' | 'standard_5g' | 'dsl_moderate' | 'unstable_mobile';

export type SpeedUnit = 'mbps' | 'kbps' | 'dual';
export type TestDurationSeconds = 10 | 30 | 60;

export type AdType = 'picture' | 'code' | 'text';
export type AdPlacement = 'header_top' | 'under_gauge' | 'sidebar_right' | 'above_results' | 'footer_bottom';

export interface AdItem {
  id: string;
  title: string;
  type: AdType;
  placement: AdPlacement;
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  htmlCode?: string;
  adText?: string;
  ctaText?: string;
  sponsorName?: string;
  badgeLabel?: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdSpaceConfig {
  id: AdPlacement;
  name: string;
  description: string;
  recommendedSize: string;
  isEnabled: boolean;
}

export interface AdminAuthSession {
  token: string;
  username: string;
  expiresAt: number;
}

