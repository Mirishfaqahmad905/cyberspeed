import fs from 'fs';
import path from 'path';

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

export interface AdStoreData {
  ads: AdItem[];
  spaces: AdSpaceConfig[];
}

const DEFAULT_SPACES: AdSpaceConfig[] = [
  {
    id: 'header_top',
    name: 'Top Header Leaderboard',
    description: 'Prominent 728x90 or responsive top banner above the main dashboard',
    recommendedSize: '728 x 90 or 970 x 90 Banner',
    isEnabled: true,
  },
  {
    id: 'under_gauge',
    name: 'In-Test Gauge Banner',
    description: 'High-visibility sponsor slot situated right below the active speed meter',
    recommendedSize: '468 x 60 or Responsive Card',
    isEnabled: true,
  },
  {
    id: 'sidebar_right',
    name: 'Right Sidebar Skyscraper / Box',
    description: 'Persistent 300x250 or 300x600 banner displayed alongside dashboard telemetry',
    recommendedSize: '300 x 250 Medium Rectangle or 300 x 600 Half Page',
    isEnabled: true,
  },
  {
    id: 'above_results',
    name: 'Pre-Results Analytics Sponsor',
    description: 'Inline banner rendered right between live graph telemetry and verified results',
    recommendedSize: '728 x 90 or 468 x 60 Native Bar',
    isEnabled: true,
  },
  {
    id: 'footer_bottom',
    name: 'Bottom Footer Banner',
    description: 'Wide horizontal footer banner for network partners & affiliate promotions',
    recommendedSize: '728 x 90 or 970 x 90 Horizontal',
    isEnabled: true,
  },
];

const DEFAULT_ADS: AdItem[] = [
  {
    id: 'ad-hdr-vpn',
    title: 'CyberShield Quantum VPN - 82% Off Ultra Gigabit Tier',
    type: 'picture',
    placement: 'header_top',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
    targetUrl: 'https://cyberspeed.network/sponsor/vpn-promo',
    altText: 'Ultra-Fast 10Gbps VPN Network',
    sponsorName: 'CyberShield VPN',
    badgeLabel: 'SPONSORED',
    adText: 'Protect your Wi-Fi with military-grade 256-bit encryption & zero lag on 10Gbps servers worldwide.',
    ctaText: 'Claim 82% Discount →',
    isActive: true,
    impressions: 1420,
    clicks: 114,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'ad-under-gauge-router',
    title: 'HyperMesh Wi-Fi 7 Router - 19 Gbps Tri-Band Speed',
    type: 'text',
    placement: 'under_gauge',
    targetUrl: 'https://cyberspeed.network/sponsor/wifi7-router',
    sponsorName: 'NextGen Hardware',
    badgeLabel: 'FEATURED HARDWARE',
    adText: 'Eliminate dead zones and cut bufferbloat with Ultra Low-Latency Wi-Fi 7 MLO technology.',
    ctaText: 'Explore Wi-Fi 7 Routers',
    isActive: true,
    impressions: 2890,
    clicks: 247,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'ad-side-cloud',
    title: 'CloudNode Edge Servers - $200 Free Cloud Credits',
    type: 'picture',
    placement: 'sidebar_right',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    targetUrl: 'https://cyberspeed.network/sponsor/cloud-edge',
    altText: 'Ultra Low Latency NVMe Cloud Compute',
    sponsorName: 'CloudNode Global',
    badgeLabel: 'OFFICIAL SPONSOR',
    adText: 'Deploy NVMe instances near 45 global edge regions in under 15 seconds with sub-5ms routing.',
    ctaText: 'Get $200 Free Credit',
    isActive: true,
    impressions: 980,
    clicks: 86,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'ad-above-res-code',
    title: 'AdSense / Custom HTML Dynamic Embed Demo',
    type: 'code',
    placement: 'above_results',
    htmlCode: `<div style="padding: 14px 18px; border-radius: 10px; background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(147,51,234,0.12) 100%); border: 1px solid rgba(6,182,212,0.25); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: 'JetBrains Mono', monospace;">
  <div style="display: flex; align-items: center; gap: 12px;">
    <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(6,182,212,0.2); border: 1px solid rgba(6,182,212,0.4); display: flex; align-items: center; justify-content: center; font-size: 20px;">⚡</div>
    <div>
      <div style="font-size: 13px; font-weight: 700; color: #38bdf8;">Gigabit Fiber Internet Upgrade Program</div>
      <div style="font-size: 11px; color: #94a3b8;">Compare local broadband providers & save up to $45/mo on symmetrical fiber plans.</div>
    </div>
  </div>
  <a href="https://cyberspeed.network/plans" target="_blank" rel="noopener noreferrer" style="background: #06b6d4; color: #050510; font-size: 11px; font-weight: 800; padding: 8px 16px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s ease;">Check Availability →</a>
</div>`,
    targetUrl: 'https://cyberspeed.network/plans',
    sponsorName: 'Broadband Search',
    badgeLabel: 'AD EMBED',
    isActive: true,
    impressions: 1150,
    clicks: 92,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'ad-foot-dns',
    title: 'DNS Shield Pro - Instant Malware & Phishing Blocker',
    type: 'text',
    placement: 'footer_bottom',
    targetUrl: 'https://cyberspeed.network/sponsor/dns-shield',
    sponsorName: 'DNS Shield Network',
    badgeLabel: 'PARTNER AD',
    adText: 'Accelerate Wi-Fi lookups and block malicious trackers automatically across all home smart devices.',
    ctaText: 'Setup Free DNS in 60s',
    isActive: true,
    impressions: 740,
    clicks: 53,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ads_data.json');

export class AdStore {
  private data: AdStoreData;

  constructor() {
    this.data = {
      ads: [...DEFAULT_ADS],
      spaces: [...DEFAULT_SPACES],
    };
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.ads)) {
          this.data.ads = parsed.ads;
        }
        if (Array.isArray(parsed.spaces)) {
          this.data.spaces = parsed.spaces;
        }
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Error loading ads data, falling back to defaults:', err);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving ads data to disk:', err);
    }
  }

  // Public: Get active ads for enabled spaces
  public getActiveAdsForFrontend(): { ads: AdItem[]; spaces: AdSpaceConfig[] } {
    const enabledSpaces = new Set(this.data.spaces.filter((s) => s.isEnabled).map((s) => s.id));
    const activeAds = this.data.ads.filter((a) => a.isActive && enabledSpaces.has(a.placement));
    return {
      ads: activeAds,
      spaces: this.data.spaces,
    };
  }

  // Admin: Get all ads with full details
  public getAllAds(): AdItem[] {
    return this.data.ads;
  }

  // Admin: Get all ad spaces
  public getAdSpaces(): AdSpaceConfig[] {
    return this.data.spaces;
  }

  // Admin: Create new Ad
  public createAd(adData: Partial<AdItem>): AdItem {
    const newAd: AdItem = {
      id: 'ad-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: adData.title || 'Sponsored Advertisement',
      type: adData.type || 'picture',
      placement: adData.placement || 'under_gauge',
      imageUrl: adData.imageUrl || '',
      targetUrl: adData.targetUrl || 'https://google.com',
      altText: adData.altText || adData.title || 'Sponsored Ad',
      htmlCode: adData.htmlCode || '',
      adText: adData.adText || '',
      ctaText: adData.ctaText || 'Learn More →',
      sponsorName: adData.sponsorName || 'Sponsor',
      badgeLabel: adData.badgeLabel || 'SPONSORED',
      isActive: adData.isActive !== false,
      impressions: 0,
      clicks: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.data.ads.unshift(newAd);
    this.saveToDisk();
    return newAd;
  }

  // Admin: Update existing Ad
  public updateAd(id: string, updates: Partial<AdItem>): AdItem | null {
    const index = this.data.ads.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const existing = this.data.ads[index];
    const updated: AdItem = {
      ...existing,
      ...updates,
      id: existing.id, // prevent id overwrite
      updatedAt: Date.now(),
    };

    this.data.ads[index] = updated;
    this.saveToDisk();
    return updated;
  }

  // Admin: Delete Ad
  public deleteAd(id: string): boolean {
    const initialLen = this.data.ads.length;
    this.data.ads = this.data.ads.filter((a) => a.id !== id);
    if (this.data.ads.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Admin: Toggle Ad active status
  public toggleAdActive(id: string): AdItem | null {
    const ad = this.data.ads.find((a) => a.id === id);
    if (!ad) return null;
    ad.isActive = !ad.isActive;
    ad.updatedAt = Date.now();
    this.saveToDisk();
    return ad;
  }

  // Admin: Update space enabled status
  public updateSpace(spaceId: AdPlacement, isEnabled: boolean): AdSpaceConfig | null {
    const space = this.data.spaces.find((s) => s.id === spaceId);
    if (!space) return null;
    space.isEnabled = isEnabled;
    this.saveToDisk();
    return space;
  }

  // Public: Track impression
  public trackImpression(adId: string): void {
    const ad = this.data.ads.find((a) => a.id === adId);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.saveToDisk();
    }
  }

  // Public: Track click
  public trackClick(adId: string): void {
    const ad = this.data.ads.find((a) => a.id === adId);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.saveToDisk();
    }
  }
}

export const adStore = new AdStore();
