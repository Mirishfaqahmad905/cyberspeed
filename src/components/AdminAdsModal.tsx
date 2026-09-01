import React, { useEffect, useState } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointer,
  Percent,
  Layers,
  Image as ImageIcon,
  Code,
  FileText,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Sparkles,
  BarChart3,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AdItem, AdPlacement, AdSpaceConfig, AdType } from '../types';
import { AdSlotBanner } from './AdSlotBanner';

interface AdminAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdsUpdated: () => void;
}

export const AdminAdsModal: React.FC<AdminAdsModalProps> = ({
  isOpen,
  onClose,
  onAdsUpdated,
}) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cyberspeed_admin_token'));
  const [usernameInput, setUsernameInput] = useState<string>('ishfaqahmad');
  const [passwordInput, setPasswordInput] = useState<string>('ishfaqahmad');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Data state
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'spaces' | 'analytics'>('campaigns');
  const [ads, setAds] = useState<AdItem[]>([]);
  const [spaces, setSpaces] = useState<AdSpaceConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter state
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Edit / Form state
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    type: AdType;
    placement: AdPlacement;
    imageUrl: string;
    targetUrl: string;
    altText: string;
    htmlCode: string;
    adText: string;
    ctaText: string;
    sponsorName: string;
    badgeLabel: string;
    isActive: boolean;
  }>({
    title: '',
    type: 'picture',
    placement: 'under_gauge',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
    targetUrl: 'https://cyberspeed.network/sponsor',
    altText: 'Ultra High-Speed Network Sponsor',
    htmlCode: `<div style="padding: 12px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 8px; color: #38bdf8; font-weight: 700; text-align: center;">⚡ Gigabit Fiber Promotion • Save 40% Today</div>`,
    adText: 'Upgrade your home Wi-Fi with ultra-low latency hardware and 10Gbps fiber speeds.',
    ctaText: 'Claim Offer →',
    sponsorName: 'Global Broadband',
    badgeLabel: 'SPONSORED',
    isActive: true,
  });

  // Verify auth or fetch data
  const fetchAdminData = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('cyberspeed_admin_token');
          setToken(null);
          throw new Error('Admin session expired. Please log in again.');
        }
        throw new Error('Failed to fetch admin data');
      }

      const data = await res.json();
      setAds(data.ads || []);
      setSpaces(data.spaces || []);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchAdminData(token);
    }
  }, [isOpen, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'ok') {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('cyberspeed_admin_token', data.token);
      setToken(data.token);
      fetchAdminData(data.token);
      setStatusMessage({ type: 'success', text: `Logged in successfully as ${data.username}` });
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('cyberspeed_admin_token');
    setToken(null);
    setAds([]);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      const url = editingAdId ? `/api/admin/ads/${editingAdId}` : '/api/admin/ads';
      const method = editingAdId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save ad');

      setStatusMessage({
        type: 'success',
        text: editingAdId ? 'Ad campaign updated successfully!' : 'New ad campaign launched!',
      });

      // Reset form
      setEditingAdId(null);
      setActiveTab('campaigns');
      fetchAdminData(token);
      onAdsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (ad: AdItem) => {
    setEditingAdId(ad.id);
    setFormData({
      title: ad.title,
      type: ad.type,
      placement: ad.placement,
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      altText: ad.altText || '',
      htmlCode: ad.htmlCode || '',
      adText: ad.adText || '',
      ctaText: ad.ctaText || '',
      sponsorName: ad.sponsorName || '',
      badgeLabel: ad.badgeLabel || 'SPONSORED',
      isActive: ad.isActive,
    });
    setActiveTab('create');
  };

  const handleDeleteAd = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this ad campaign?')) return;
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete ad');
      setStatusMessage({ type: 'success', text: 'Ad removed successfully' });
      fetchAdminData(token);
      onAdsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/ads/toggle/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle ad status');
      fetchAdminData(token);
      onAdsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleToggleSpace = async (spaceId: AdPlacement, currentEnabled: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/spaces/${spaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error('Failed to toggle space');
      fetchAdminData(token);
      onAdsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  if (!isOpen) return null;

  const filteredAds = ads.filter((ad) => {
    if (filterPlacement !== 'all' && ad.placement !== filterPlacement) return false;
    if (filterType !== 'all' && ad.type !== filterType) return false;
    return true;
  });

  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 rounded-2xl bg-[#0A0B1A] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Ad Space & Monetization Control Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-tech font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  BACKEND ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                Manage live advertisements, placement zones, picture/code/text banners, and click analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* If NOT logged in, show Auth Gate */}
          {!token ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-100 font-display">
                  Admin Authentication Required
                </h4>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  Enter your administrative credentials to manage banner ads & spaces
                </p>
              </div>

              {/* Default Credential Notice */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-left font-mono-tech text-xs text-slate-300">
                <span className="text-cyan-400 font-bold block mb-1">Default Admin Access:</span>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Username: <code className="text-cyan-300">ishfaqahmad</code></span>
                  <span>Password: <code className="text-cyan-300">ishfaqahmad</code></span>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono-tech flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 font-mono-tech text-xs text-left">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#050510] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Verifying...' : 'Sign In to Ad Manager'}</span>
                </button>
              </form>
            </div>
          ) : (
            // LOGGED IN DASHBOARD
            <div className="space-y-6 font-mono-tech">
              {/* Admin Navigation Bar & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveTab('campaigns');
                      setEditingAdId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'campaigns'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Ad Campaigns ({ads.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('create');
                      if (!editingAdId) {
                        setFormData({
                          title: '',
                          type: 'picture',
                          placement: 'under_gauge',
                          imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
                          targetUrl: 'https://cyberspeed.network/sponsor',
                          altText: 'Ultra High-Speed Network Sponsor',
                          htmlCode: `<div style="padding: 12px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 8px; color: #38bdf8; font-weight: 700; text-align: center;">⚡ Gigabit Fiber Promotion • Save 40% Today</div>`,
                          adText: 'Upgrade your home Wi-Fi with ultra-low latency hardware.',
                          ctaText: 'Learn More →',
                          sponsorName: 'Broadband Partner',
                          badgeLabel: 'SPONSORED',
                          isActive: true,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'create'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingAdId ? 'Edit Ad' : 'Create New Ad'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('spaces')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'spaces'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ad Spaces & Slots ({spaces.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'analytics'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    Admin: <strong className="text-cyan-300">ishfaqahmad</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/40 border border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                  <button
                    onClick={() => setStatusMessage(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ---------------- TAB 1: CAMPAIGNS LIST ---------------- */}
              {activeTab === 'campaigns' && (
                <div className="space-y-4">
                  {/* Filter & Action toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                      <select
                        value={filterPlacement}
                        onChange={(e) => setFilterPlacement(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="all">All Placements</option>
                        <option value="header_top">Header Top</option>
                        <option value="under_gauge">Under Gauge</option>
                        <option value="sidebar_right">Sidebar Right</option>
                        <option value="above_results">Above Results</option>
                        <option value="footer_bottom">Footer Bottom</option>
                      </select>

                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="all">All Ad Formats</option>
                        <option value="picture">Picture / Banner</option>
                        <option value="code">Custom Code / Embed</option>
                        <option value="text">Native / Text</option>
                      </select>

                      <button
                        onClick={() => token && fetchAdminData(token)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                        title="Refresh Ads"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAdId(null);
                        setActiveTab('create');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#050510] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Ad</span>
                    </button>
                  </div>

                  {/* Ads List Table / Cards */}
                  {filteredAds.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-black/30 border border-white/5 text-slate-400">
                      No advertisements match the selected filters.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAds.map((ad) => {
                        const ctr =
                          ad.impressions > 0
                            ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                            : '0.00';

                        return (
                          <div
                            key={ad.id}
                            className={`p-4 rounded-xl bg-black/40 border transition-all ${
                              ad.isActive
                                ? 'border-white/10 hover:border-cyan-500/30'
                                : 'border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                              {/* Left Info */}
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 shrink-0 mt-0.5">
                                  {ad.type === 'picture' && <ImageIcon className="w-4 h-4" />}
                                  {ad.type === 'code' && <Code className="w-4 h-4 text-purple-400" />}
                                  {ad.type === 'text' && <FileText className="w-4 h-4 text-emerald-400" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                                      {ad.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                      Slot: {ad.placement.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Sponsor: {ad.sponsorName || 'N/A'}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-bold text-slate-100 mt-1 truncate">
                                    {ad.title}
                                  </h4>

                                  {ad.targetUrl && (
                                    <a
                                      href={ad.targetUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1 mt-0.5 truncate"
                                    >
                                      <span>{ad.targetUrl}</span>
                                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Telemetry Metrics */}
                              <div className="flex items-center gap-4 text-xs shrink-0 self-stretch lg:self-center justify-between lg:justify-start border-t lg:border-t-0 pt-2 lg:pt-0 border-white/5">
                                <div className="text-center px-2">
                                  <span className="text-[9px] text-slate-500 block uppercase">
                                    Impressions
                                  </span>
                                  <span className="text-slate-200 font-bold">
                                    {ad.impressions.toLocaleString()}
                                  </span>
                                </div>

                                <div className="text-center px-2">
                                  <span className="text-[9px] text-slate-500 block uppercase">
                                    Clicks
                                  </span>
                                  <span className="text-cyan-400 font-bold">
                                    {ad.clicks.toLocaleString()}
                                  </span>
                                </div>

                                <div className="text-center px-2">
                                  <span className="text-[9px] text-slate-500 block uppercase">
                                    CTR
                                  </span>
                                  <span className="text-emerald-400 font-bold">{ctr}%</span>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                                  <button
                                    onClick={() => handleToggleActive(ad.id)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                      ad.isActive
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-slate-700/30 text-slate-400 border border-white/10'
                                    }`}
                                    title="Toggle Active"
                                  >
                                    {ad.isActive ? 'Active' : 'Paused'}
                                  </button>

                                  <button
                                    onClick={() => handleEditClick(ad)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors cursor-pointer"
                                    title="Edit Ad"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                                    title="Delete Ad"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- TAB 2: CREATE / EDIT AD FORM ---------------- */}
              {activeTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Form fields (7 cols) */}
                  <form onSubmit={handleSaveAd} className="lg:col-span-7 space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-100">
                          {editingAdId ? 'Edit Advertisement' : 'Launch New Advertisement'}
                        </h4>
                        <span className="text-[10px] text-cyan-400 uppercase font-bold">
                          Step 1: Configuration
                        </span>
                      </div>

                      {/* Ad Format Selector */}
                      <div>
                        <label className="block text-slate-400 mb-1.5 uppercase tracking-wider text-[10px] font-bold">
                          Ad Format / Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'picture' })}
                            className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              formData.type === 'picture'
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-[10px]">Picture Banner</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'code' })}
                            className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              formData.type === 'code'
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Code className="w-4 h-4" />
                            <span className="text-[10px]">Custom Code / Embed</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'text' })}
                            className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              formData.type === 'text'
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-[10px]">Native Text Ad</span>
                          </button>
                        </div>
                      </div>

                      {/* Placement Spot */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                            Target Placement Zone
                          </label>
                          <select
                            value={formData.placement}
                            onChange={(e) =>
                              setFormData({ ...formData, placement: e.target.value as AdPlacement })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="header_top">Header Top Leaderboard</option>
                            <option value="under_gauge">In-Test / Under Gauge</option>
                            <option value="sidebar_right">Sidebar Right Skyscraper</option>
                            <option value="above_results">Above Results Banner</option>
                            <option value="footer_bottom">Footer Bottom Banner</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                            Sponsor Organization Name
                          </label>
                          <input
                            type="text"
                            value={formData.sponsorName}
                            onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                            placeholder="e.g. Starlink, ExpressVPN"
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Ad Title */}
                      <div>
                        <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                          Ad Headline / Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          placeholder="e.g. CyberShield VPN - 80% Off Gigabit Tier"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* PICTURE FORMAT SPECIFIC FIELDS */}
                      {formData.type === 'picture' && (
                        <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div>
                            <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                              Image Banner URL
                            </label>
                            <input
                              type="url"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              placeholder="https://example.com/banner.jpg"
                              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                            {/* Preset sample banner images */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] text-slate-400">
                              <span>Quick presets:</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    imageUrl:
                                      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-300 cursor-pointer"
                              >
                                Server Matrix
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    imageUrl:
                                      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-purple-300 cursor-pointer"
                              >
                                Cloud Datacenter
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    imageUrl:
                                      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-emerald-300 cursor-pointer"
                              >
                                Microchip
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                                CTA Button Label
                              </label>
                              <input
                                type="text"
                                value={formData.ctaText}
                                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                placeholder="e.g. Claim 80% Off →"
                                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                                Badge Tag
                              </label>
                              <input
                                type="text"
                                value={formData.badgeLabel}
                                onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                                placeholder="SPONSORED"
                                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CODE FORMAT SPECIFIC FIELDS */}
                      {formData.type === 'code' && (
                        <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                            HTML / Script / Embed Snippet
                          </label>
                          <textarea
                            rows={5}
                            value={formData.htmlCode}
                            onChange={(e) => setFormData({ ...formData, htmlCode: e.target.value })}
                            placeholder="<div><!-- AdSense code or HTML snippet --></div>"
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          />
                        </div>
                      )}

                      {/* TEXT / NATIVE FIELDS */}
                      {formData.type === 'text' && (
                        <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div>
                            <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                              Ad Description / Body Copy
                            </label>
                            <textarea
                              rows={2}
                              value={formData.adText}
                              onChange={(e) => setFormData({ ...formData, adText: e.target.value })}
                              placeholder="Promote your product features with clear high-converting copy..."
                              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                                CTA Button Text
                              </label>
                              <input
                                type="text"
                                value={formData.ctaText}
                                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                placeholder="Explore Options →"
                                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                                Badge Tag
                              </label>
                              <input
                                type="text"
                                value={formData.badgeLabel}
                                onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                                placeholder="FEATURED"
                                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Destination URL */}
                      <div>
                        <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold">
                          Destination / Affiliate Link URL
                        </label>
                        <input
                          type="url"
                          value={formData.targetUrl}
                          onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                          required
                          placeholder="https://sponsor-website.com/deal"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Submit and Cancel Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAdId(null);
                            setActiveTab('campaigns');
                          }}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#050510] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
                        >
                          {editingAdId ? 'Save Changes' : 'Launch Ad Campaign'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Live Ad Preview (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Live Banner Preview</span>
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase">
                          Rendering in {formData.placement}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050510] border border-white/5">
                        <AdSlotBanner
                          placement={formData.placement}
                          ad={{
                            id: 'preview-ad',
                            title: formData.title || 'Sample Advertisement Title',
                            type: formData.type,
                            placement: formData.placement,
                            imageUrl: formData.imageUrl,
                            targetUrl: formData.targetUrl,
                            altText: formData.altText || formData.title,
                            htmlCode: formData.htmlCode,
                            adText: formData.adText,
                            ctaText: formData.ctaText,
                            sponsorName: formData.sponsorName || 'Sample Sponsor',
                            badgeLabel: formData.badgeLabel || 'SPONSORED',
                            isActive: true,
                            impressions: 0,
                            clicks: 0,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                          }}
                          space={{
                            id: formData.placement,
                            name: formData.placement,
                            description: '',
                            recommendedSize: 'Responsive',
                            isEnabled: true,
                          }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        This preview renders exactly how active users on the speed test tool will experience this sponsor banner.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- TAB 3: AD SPACES & SLOTS ---------------- */}
              {activeTab === 'spaces' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <h4 className="text-sm font-bold text-slate-100">
                      Frontend Ad Placement Slots
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enable or disable individual ad positions across the website layout. When disabled, the space collapses and no code or banners load.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spaces.map((space) => {
                      const matchingAdsCount = ads.filter(
                        (a) => a.placement === space.id && a.isActive
                      ).length;

                      return (
                        <div
                          key={space.id}
                          className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">
                                {space.name}
                              </span>
                              <button
                                onClick={() => handleToggleSpace(space.id, space.isEnabled)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                  space.isEnabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                }`}
                              >
                                {space.isEnabled ? (
                                  <>
                                    <ToggleRight className="w-3.5 h-3.5" />
                                    <span>Enabled</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-3.5 h-3.5" />
                                    <span>Disabled</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {space.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-2">
                            <span>Recommended: <strong className="text-slate-300">{space.recommendedSize}</strong></span>
                            <span>Active Ads: <strong className="text-cyan-400">{matchingAdsCount}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------- TAB 4: ANALYTICS ---------------- */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Total Ad Impressions
                        </span>
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl font-black text-slate-100 font-display mt-2">
                        {totalImpressions.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Across all active slots
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Total Ad Clicks
                        </span>
                        <MousePointer className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-300 font-display mt-2">
                        {totalClicks.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Verified user interactions
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Overall Click-Through Rate
                        </span>
                        <Percent className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-300 font-display mt-2">
                        {overallCtr}%
                      </div>
                      <span className="text-[10px] text-emerald-400/80 block mt-1">
                        Healthy monetization ratio
                      </span>
                    </div>
                  </div>

                  {/* Top Campaigns Breakdown */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-slate-100">
                      Campaign Performance Breakdown
                    </h4>

                    <div className="space-y-2">
                      {ads.map((ad) => {
                        const ctr =
                          ad.impressions > 0
                            ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                            : '0.00';

                        return (
                          <div
                            key={ad.id}
                            className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-slate-200 font-bold block truncate">
                                {ad.title}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase">
                                {ad.placement} • {ad.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 text-[11px]">
                              <span className="text-slate-400">
                                {ad.impressions.toLocaleString()} views
                              </span>
                              <span className="text-cyan-400 font-bold">
                                {ad.clicks.toLocaleString()} clicks
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                                {ctr}% CTR
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs font-mono-tech text-slate-500">
          <span>CyberSpeed AdEngine v2.5</span>
          <span>Admin Credentials: ishfaqahmad / ishfaqahmad</span>
        </div>
      </div>
    </div>
  );
};
