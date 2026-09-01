import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, Tag, ShieldCheck, Megaphone } from 'lucide-react';
import { AdItem, AdPlacement, AdSpaceConfig } from '../types';

interface AdSlotBannerProps {
  placement: AdPlacement;
  ad: AdItem | null;
  space: AdSpaceConfig | null;
  onTrackImpression?: (adId: string) => void;
  onTrackClick?: (adId: string) => void;
  onOpenAdminManager?: () => void;
  className?: string;
}

export const AdSlotBanner: React.FC<AdSlotBannerProps> = ({
  placement,
  ad,
  space,
  onTrackImpression,
  onTrackClick,
  onOpenAdminManager,
  className = '',
}) => {
  const impressionTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (ad && ad.id && impressionTrackedRef.current !== ad.id) {
      impressionTrackedRef.current = ad.id;
      if (onTrackImpression) {
        onTrackImpression(ad.id);
      }
    }
  }, [ad, onTrackImpression]);

  // If the space is explicitly disabled in admin settings, do not render anything
  if (space && !space.isEnabled) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent) => {
    if (ad && onTrackClick) {
      onTrackClick(ad.id);
    }
  };

  // If no ad is assigned to this active slot, show a sleek placeholder banner with Admin hook
  if (!ad) {
    return (
      <div
        id={`ad-space-${placement}`}
        className={`w-full p-3 rounded-xl bg-[#0A0B1A]/70 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-tech ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {space?.name || `Ad Space: ${placement}`}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-white/5 text-slate-400">
                {space?.recommendedSize || 'Responsive'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Premium sponsor space ready for Picture, Custom Code, or Native Ads.
            </p>
          </div>
        </div>

        {onOpenAdminManager && (
          <button
            onClick={onOpenAdminManager}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer shrink-0"
          >
            Manage Ad Space →
          </button>
        )}
      </div>
    );
  }

  // 1. CODE TYPE AD (HTML / Script / Embed / AdSense)
  if (ad.type === 'code' && ad.htmlCode) {
    return (
      <div
        id={`ad-slot-${placement}-${ad.id}`}
        className={`w-full rounded-xl bg-[#0A0B1A] border border-white/10 overflow-hidden relative group ${className}`}
      >
        {/* Subtle Sponsor Label Header */}
        <div className="px-3 py-1 bg-black/40 border-b border-white/5 flex items-center justify-between text-[9px] font-mono-tech text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest text-[8px]">
              {ad.badgeLabel || 'SPONSORED'}
            </span>
            <span>{ad.sponsorName || 'Network Sponsor'}</span>
          </div>
          <span className="text-slate-600 uppercase tracking-wider">{placement.replace('_', ' ')}</span>
        </div>

        <div
          className="p-2 sm:p-3 overflow-x-auto"
          onClick={handleAdClick}
          dangerouslySetInnerHTML={{ __html: ad.htmlCode }}
        />
      </div>
    );
  }

  // 2. PICTURE TYPE AD (Image Banner + Link + Info)
  if (ad.type === 'picture') {
    return (
      <a
        id={`ad-slot-${placement}-${ad.id}`}
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        className={`w-full block group rounded-xl bg-[#0A0B1A] border border-white/10 hover:border-cyan-500/40 transition-all overflow-hidden relative shadow-lg ${className}`}
      >
        {/* Header tag */}
        <div className="px-3 py-1 bg-black/50 border-b border-white/5 flex items-center justify-between text-[9px] font-mono-tech text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-widest text-[8px]">
              {ad.badgeLabel || 'SPONSOR'}
            </span>
            <span className="text-slate-300 font-medium">{ad.sponsorName || 'CyberSpeed Partner'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition-colors">
            <span className="text-[8px] uppercase tracking-widest">Visit Sponsor</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Content Layout */}
        <div className="p-3 flex flex-col sm:flex-row items-center gap-3">
          {ad.imageUrl && (
            <div className="w-full sm:w-36 h-20 sm:h-18 rounded-lg overflow-hidden shrink-0 relative bg-black/40 border border-white/5">
              <img
                src={ad.imageUrl}
                alt={ad.altText || ad.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-1">
              {ad.title}
            </h4>
            {ad.adText && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ad.adText}
              </p>
            )}
          </div>

          {ad.ctaText && (
            <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-1.5 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-[#050510] border border-cyan-500/40 transition-all">
                <span>{ad.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
      </a>
    );
  }

  // 3. TEXT / NATIVE TYPE AD
  return (
    <a
      id={`ad-slot-${placement}-${ad.id}`}
      href={ad.targetUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAdClick}
      className={`w-full block group rounded-xl bg-[#0A0B1A] border border-white/10 hover:border-cyan-500/40 p-3.5 transition-all shadow-md relative ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono-tech font-bold bg-cyan-500/20 text-cyan-300 uppercase tracking-widest">
                {ad.badgeLabel || 'SPONSORED'}
              </span>
              <span className="text-[10px] font-mono-tech text-slate-400">
                {ad.sponsorName || 'Official Partner'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-0.5 line-clamp-1">
              {ad.title}
            </h4>
            {ad.adText && (
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {ad.adText}
              </p>
            )}
          </div>
        </div>

        {ad.ctaText && (
          <span className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-white/5 group-hover:bg-cyan-500 text-slate-300 group-hover:text-[#050510] border border-white/10 group-hover:border-cyan-500 transition-all shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </div>
    </a>
  );
};
