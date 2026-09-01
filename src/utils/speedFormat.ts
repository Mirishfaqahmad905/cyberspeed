import { SpeedUnit } from '../types';

/**
 * Formats a speed value in Mbps into selected unit display (Mbps, Kbps, Dual)
 */
export function formatSpeedDisplay(mbps: number, unit: SpeedUnit = 'mbps'): string {
  if (!Number.isFinite(mbps) || mbps < 0) return '0.0';

  if (unit === 'kbps') {
    const kbps = Math.round(mbps * 1000);
    return `${kbps.toLocaleString()} Kbps`;
  }

  if (unit === 'dual') {
    const kbps = Math.round(mbps * 1000);
    return `${mbps.toFixed(1)} Mbps • ${kbps.toLocaleString()} Kbps`;
  }

  return `${mbps.toFixed(1)} Mbps`;
}

/**
 * Returns just the numeric value converted to the active unit
 */
export function getSpeedNumericValue(mbps: number, unit: SpeedUnit = 'mbps'): number {
  if (!Number.isFinite(mbps) || mbps < 0) return 0;
  if (unit === 'kbps') {
    return Math.round(mbps * 1000);
  }
  return Number(mbps.toFixed(1));
}

/**
 * Returns the unit label
 */
export function getSpeedUnitLabel(unit: SpeedUnit = 'mbps'): string {
  if (unit === 'kbps') return 'Kbps';
  if (unit === 'dual') return 'Mbps / Kbps';
  return 'Mbps';
}

/**
 * Format bytes into human readable MB or GB
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}
