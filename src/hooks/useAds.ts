import { useCallback, useEffect, useState } from 'react';
import { AdItem, AdPlacement, AdSpaceConfig } from '../types';

export function useAds() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [spaces, setSpaces] = useState<AdSpaceConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ads', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load advertisements');
      const data = await res.json();
      setAds(data.ads || []);
      setSpaces(data.spaces || []);
      setError(null);
    } catch (err: any) {
      console.warn('Could not fetch active ads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const trackImpression = useCallback(async (adId: string) => {
    try {
      await fetch(`/api/ads/track/impression/${adId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  }, []);

  const trackClick = useCallback(async (adId: string) => {
    try {
      await fetch(`/api/ads/track/click/${adId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  }, []);

  const getAdForPlacement = useCallback(
    (placement: AdPlacement): { ad: AdItem | null; space: AdSpaceConfig | null } => {
      const space = spaces.find((s) => s.id === placement) || null;
      if (space && !space.isEnabled) {
        return { ad: null, space };
      }

      const matchingAds = ads.filter((a) => a.placement === placement && a.isActive);
      if (matchingAds.length === 0) {
        return { ad: null, space };
      }

      // Pick randomly or rotate among matching active ads for that placement
      const selected = matchingAds[Math.floor(Math.random() * matchingAds.length)];
      return { ad: selected, space };
    },
    [ads, spaces]
  );

  return {
    ads,
    spaces,
    loading,
    error,
    refreshAds: fetchAds,
    trackImpression,
    trackClick,
    getAdForPlacement,
  };
}
