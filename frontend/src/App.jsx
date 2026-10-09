import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Sliders, 
  Layers, 
  RefreshCw, 
  ArrowUpDown, 
  ExternalLink, 
  AlertTriangle,
  Building2,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

import ThreatCard from './components/ThreatCard';
import DeepInspectModal from './components/DeepInspectModal';
import BrandProfileModal from './components/BrandProfileModal';
import WeightsDrawer from './components/WeightsDrawer';

const API_BASE = '/api';

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, APPS, SOCIAL, OFFICIAL
  const [sortBy, setSortBy] = useState('FINAL_SCORE'); // FINAL_SCORE, PFP, NAME, DESC, COMPLAINTS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWeightsDrawer, setShowWeightsDrawer] = useState(false);
  const [weights, setWeights] = useState({
    desc: 0.25,
    pfp: 0.20,
    name: 0.20,
    reports: 0.15,
    publisher: 0.10,
    link: 0.10
  });

  // Fetch initial brand profiles
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/brand-profiles`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        if (data.length > 0 && !selectedProfile) {
          setSelectedProfile(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load brand profiles', err);
    }
  };

  const handleStartScan = async () => {
    if (!selectedProfile) return;
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/scan/live?profile_id=${selectedProfile.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      }
    } catch (err) {
      console.error('Scan execution error', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/brand-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const newProf = await res.json();
        setProfiles([...profiles, newProf]);
        setSelectedProfile(newProf);
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const handleResetWeights = () => {
    setWeights({
      desc: 0.25,
      pfp: 0.20,
      name: 0.20,
      reports: 0.15,
      publisher: 0.10,
      link: 0.10
    });
  };

  const handleWhitelistAsset = (threat) => {
    if (!selectedProfile) return;
    // Add threat handle or bundle id to official profile
    const updated = {
      ...selectedProfile,
      official_handles: [...selectedProfile.official_handles, threat.handle_or_id],
      official_app_ids: [...selectedProfile.official_app_ids, threat.handle_or_id]
    };
    setSelectedProfile(updated);
    // Mark locally as whitelisted
    if (scanResult) {
      const updatedResults = scanResult.results.map(r => 
        r.id === threat.id ? { ...r, is_official_asset: true, exclusion_reason: "Whitelisted by Security Analyst" } : r
      );
      setScanResult({ ...scanResult, results: updatedResults });
    }
  };

  // Re-calculate scores dynamically if weights adjusted
  const computedResults = React.useMemo(() => {
    if (!scanResult?.results) return [];
    
    // Normalize weights
    const totalW = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const normW = {
      desc: weights.desc / totalW,
      pfp: weights.pfp / totalW,
      name: weights.name / totalW,
      reports: weights.reports / totalW,
      publisher: weights.publisher / totalW,
      link: weights.link / totalW,
    };

    return scanResult.results.map(item => {
      if (item.is_official_asset) return item;
      const b = item.breakdown;
      const finalScore = Math.round(
        (normW.desc * b.desc_score) +
        (normW.pfp * b.pfp_score) +
        (normW.name * b.name_score) +
        (normW.reports * b.reports_score) +
        (normW.publisher * b.publisher_score) +
        (normW.link * b.link_score)
      );
      
      let severity = "LOW";
      if (finalScore >= 75) severity = "CRITICAL";
      else if (finalScore >= 50) severity = "HIGH";
      else if (finalScore >= 30) severity = "MEDIUM";

      return {
        ...item,
        final_score: finalScore,
        severity
      };
    });
  }, [scanResult, weights]);

  // Filtering & Custom Sorting Logic
  const filteredAndSortedThreats = React.useMemo(() => {
    return computedResults
      .filter(item => {
        // Tab filter
        if (activeTab === 'APPS') return item.asset_type === 'MOBILE_APP' && !item.is_official_asset;
        if (activeTab === 'SOCIAL') return item.asset_type === 'SOCIAL_PROFILE' && !item.is_official_asset;
        if (activeTab === 'OFFICIAL') return item.is_official_asset;
        return true;
      })
      .filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.handle_or_id.toLowerCase().includes(q) ||
          item.developer_or_publisher.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Always place non-official ahead of official unless official tab
        if (activeTab !== 'OFFICIAL') {
          if (a.is_official_asset !== b.is_official_asset) {
            return a.is_official_asset ? 1 : -1;
          }
        }
        if (sortBy === 'FINAL_SCORE') return b.final_score - a.final_score;
        if (sortBy === 'PFP') return b.breakdown.pfp_score - a.breakdown.pfp_score;
        if (sortBy === 'NAME') return b.breakdown.name_score - a.breakdown.name_score;
        if (sortBy === 'DESC') return b.breakdown.desc_score - a.breakdown.desc_score;
        if (sortBy === 'COMPLAINTS') return b.breakdown.reports_score - a.breakdown.reports_score;
        return 0;
      });
  }, [computedResults, activeTab, searchQuery, sortBy]);

  // Summary Metrics
  const totalScanned = computedResults.length;
  const criticalCount = computedResults.filter(r => !r.is_official_asset && r.severity === 'CRITICAL').length;
  const highCount = computedResults.filter(r => !r.is_official_asset && r.severity === 'HIGH').length;
  const officialExcludedCount = computedResults.filter(r => r.is_official_asset).length;

  return (
    <div className="min-h-screen bg-[#090D14] text-gray-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-[#1E293B] bg-[#0E131F]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">HACXL SHIELD</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DRP Intelligence
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Social & App Store Impersonation Protection</p>
            </div>
          </div>

          {/* Profile Switcher & Primary Action */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141B2D] border border-[#232F46] hover:border-indigo-500/50 text-xs font-medium text-gray-200 transition"
            >
              <Building2 size={14} className="text-indigo-400" />
              <span>Target: <strong className="text-white">{selectedProfile?.brand_name || 'Select'}</strong></span>
            </button>

            <button 
              onClick={handleStartScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition ${
                isScanning 
                  ? 'bg-indigo-700 cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/25 active:scale-95'
              }`}
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? 'Scanning Stores & Socials...' : 'Run Surveillance Scan'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">

        {/* Zajno-style KPI Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#101624] border border-[#1E293B]">
            <div className="text-xs text-gray-400 mb-1">Total Assets Discovered</div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalScanned || '—'}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              Live Stores & Social Streams
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101624] border border-[#1E293B]">
            <div className="text-xs text-gray-400 mb-1">Critical Impersonations</div>
            <div className="text-2xl font-bold text-rose-400 tracking-tight">{criticalCount}</div>
            <div className="text-[11px] text-rose-400/80 mt-1 font-mono">
              High Clone / Phishing Risk
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101624] border border-[#1E293B]">
            <div className="text-xs text-gray-400 mb-1">High Severity Alerts</div>
            <div className="text-2xl font-bold text-amber-400 tracking-tight">{highCount}</div>
            <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
              Lookalike & Support Spoofs
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101624] border border-[#1E293B]">
            <div className="text-xs text-gray-400 mb-1">Official Assets Protected</div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{officialExcludedCount}</div>
            <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">
              100% Whitelist Filtered
            </div>
          </div>
        </div>

        {/* Source Health / Resilience Status Pill (Evaluation Graceful Handling) */}
        {scanResult?.source_statuses && (
          <div className="p-3.5 rounded-xl bg-[#0D121D] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Info size={14} className="text-cyan-400" />
              <span className="font-semibold text-white">Live Ingestion Health:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {scanResult.source_statuses.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${
                    s.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-gray-300">{s.source}</span>
                  <span className="text-gray-500">({s.count} found)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Weight Drawer */}
        {showWeightsDrawer && (
          <WeightsDrawer 
            weights={weights} 
            onChange={handleWeightChange} 
            onReset={handleResetWeights}
            onClose={() => setShowWeightsDrawer(false)}
          />
        )}

        {/* Controls, Filter & Custom Sorting Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#101624] p-3 rounded-2xl border border-[#1E293B]">
          
          {/* Surface Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#090D14] rounded-xl border border-white/5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Findings' },
              { id: 'APPS', label: 'App Stores (iOS & Play)' },
              { id: 'SOCIAL', label: 'Social & Communities' },
              { id: 'OFFICIAL', label: 'Official / Whitelisted' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Sort Dropdown, and Weight Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#090D14] border border-[#232F46] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Custom Sort Feature requested by user */}
            <div className="flex items-center gap-1.5 bg-[#090D14] px-2.5 py-1.5 rounded-xl border border-[#232F46]">
              <ArrowUpDown size={13} className="text-gray-400" />
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="FINAL_SCORE" className="bg-[#121824]">Sort: Composite Risk</option>
                <option value="PFP" className="bg-[#121824]">Sort: Logo / PFP Match</option>
                <option value="NAME" className="bg-[#121824]">Sort: Look-alike Name</option>
                <option value="DESC" className="bg-[#121824]">Sort: Description Intent</option>
                <option value="COMPLAINTS" className="bg-[#121824]">Sort: Community Complaints</option>
              </select>
            </div>

            <button 
              onClick={() => setShowWeightsDrawer(!showWeightsDrawer)}
              className={`p-2 rounded-xl border transition ${
                showWeightsDrawer 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                  : 'bg-[#090D14] border-[#232F46] text-gray-400 hover:text-white'
              }`}
              title="Tune Scoring Weights"
            >
              <Sliders size={14} />
            </button>
          </div>

        </div>

        {/* Threat Feed List */}
        <div className="space-y-3">
          {filteredAndSortedThreats.length > 0 ? (
            filteredAndSortedThreats.map(threat => (
              <ThreatCard 
                key={threat.id} 
                item={threat} 
                onInspect={(item) => setSelectedThreat(item)}
                onWhitelist={handleWhitelistAsset}
              />
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#101624] border border-[#1E293B]">
              <ShieldCheck size={36} className="text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-300">No matching threat intelligence</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {scanResult ? 'Try clearing your search filters or switching tabs.' : 'Click "Run Surveillance Scan" to initiate live discovery across App Stores and Social Networks.'}
              </p>
              {!scanResult && (
                <button 
                  onClick={handleStartScan}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Start Scan Now
                </button>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Deep Inspection Drawer / Modal */}
      {selectedThreat && (
        <DeepInspectModal 
          threat={selectedThreat} 
          officialProfile={selectedProfile}
          onClose={() => setSelectedThreat(null)}
        />
      )}

      {/* Brand Ground Truth Modal */}
      {showProfileModal && (
        <BrandProfileModal 
          profile={selectedProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

    </div>
  );
}
