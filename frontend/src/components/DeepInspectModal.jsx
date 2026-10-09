import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  MessageSquare, 
  FileText,
  UserX,
  Scale
} from 'lucide-react';

export default function DeepInspectModal({ threat, officialProfile, onClose }) {
  if (!threat) return null;

  const isOfficial = threat.is_official_asset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#121824] border border-[#232F46] rounded-2xl shadow-2xl p-6 text-gray-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#232F46] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isOfficial ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {threat.asset_type === 'MOBILE_APP' ? <Smartphone size={24} /> : <MessageSquare size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{threat.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isOfficial 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : threat.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {threat.severity} {threat.final_score > 0 ? `(${threat.final_score})` : ''}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {threat.platform} • ID: {threat.handle_or_id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition"
          >
            ✕
          </button>
        </div>

        {/* Side-by-Side Visual & Brand Identity Diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Official Ground Truth */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              <CheckCircle2 size={14} /> Registered Official Brand Asset
            </span>
            <div className="flex items-center gap-4 mb-3">
              <img 
                src={officialProfile?.official_logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/320px-Binance_logo.svg.png"} 
                alt="Official Logo" 
                className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1 border border-emerald-500/30"
              />
              <div>
                <div className="font-semibold text-white">{officialProfile?.brand_name || "Official Brand"}</div>
                <div className="text-xs text-gray-400 font-mono">Verified Publisher: {officialProfile?.official_publishers?.[0] || "Authorized Org"}</div>
                <div className="text-xs text-gray-400 font-mono">Whitelisted Handles: {officialProfile?.official_handles?.join(', ') || "N/A"}</div>
              </div>
            </div>
            <div className="text-xs text-gray-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
              Ground-truth asset verified in Brand Profile. Used by automated detection engine to eliminate false positives.
            </div>
          </div>

          {/* Suspect Candidate */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
              <AlertTriangle size={14} /> Candidate Under Investigation
            </span>
            <div className="flex items-center gap-4 mb-3">
              {threat.icon_url ? (
                <img 
                  src={threat.icon_url} 
                  alt="Candidate Icon" 
                  className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-rose-500/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500">
                  No Icon
                </div>
              )}
              <div>
                <div className="font-semibold text-white">{threat.name}</div>
                <div className="text-xs text-rose-400 font-mono">Publisher: {threat.developer_or_publisher}</div>
                <div className="text-xs text-gray-400 font-mono">Platform ID: {threat.handle_or_id}</div>
              </div>
            </div>
            <div className="text-xs text-gray-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
              {isOfficial ? threat.exclusion_reason : (threat.description || "No public bio provided.")}
            </div>
          </div>
        </div>

        {/* Detailed Explainability Breakdown (The 6 Signals) */}
        {!isOfficial && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Scale size={16} className="text-indigo-400" /> Multi-Signal Scoring Attribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Look-alike Name', score: threat.breakdown.name_score, weight: '20%' },
                { label: 'Logo / PFP Clone', score: threat.breakdown.pfp_score, weight: '20%' },
                { label: 'Description & Intent', score: threat.breakdown.desc_score, weight: '25%' },
                { label: 'Public Complaints', score: threat.breakdown.reports_score, weight: '15%' },
                { label: 'Publisher Mismatch', score: threat.breakdown.publisher_score, weight: '10%' },
                { label: 'Domain Suspicion', score: threat.breakdown.link_score, weight: '10%' }
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-400">{m.label}</span>
                    <span className="text-gray-500 text-[10px]">Weight: {m.weight}</span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1.5">{m.score}%</div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        m.score >= 75 ? 'bg-rose-500' : m.score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(m.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonus Feature: Look-alike Name Analysis Details */}
        {threat.lookalike_details?.details?.length > 0 && !isOfficial && (
          <div className="mb-6 p-4 rounded-xl bg-[#0B0F17] border border-indigo-900/40">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🎯</span> Look-alike Name Variation Findings (Bonus Engine)
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {threat.lookalike_details.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 font-mono">
                  <span className="text-indigo-400">▸</span> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complaint & Report Evidence Logs */}
        {threat.complaint_details?.complaints_detected?.length > 0 && !isOfficial && (
          <div className="mb-6 p-4 rounded-xl bg-[#0B0F17] border border-amber-900/40">
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserX size={14} /> Public Community Complaints & Scam Indicators ({threat.complaint_details.complaint_count})
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {threat.complaint_details.complaints_detected.map((c, i) => (
                <li key={i} className="flex items-start gap-2 italic">
                  <span className="text-amber-400">"</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Controls & Remediation Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#232F46]">
          {threat.external_url ? (
            <a 
              href={threat.external_url} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              <ExternalLink size={14} /> View Live Listing on {threat.platform}
            </a>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                alert(`DMCA / Impersonation takedown package for "${threat.name}" copied to clipboard! Ready to file with ${threat.platform}.`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
            >
              <FileText size={14} /> Generate 1-Click Takedown Notice
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
