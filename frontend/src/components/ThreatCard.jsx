import React from 'react';
import { 
  Smartphone, 
  MessageSquare, 
  AlertOctagon, 
  CheckCircle, 
  ExternalLink, 
  Eye, 
  Flag,
  UserX,
  FileCheck
} from 'lucide-react';

export default function ThreatCard({ item, onInspect, onWhitelist }) {
  const isOfficial = item.is_official_asset;

  return (
    <div className={`p-5 rounded-2xl transition duration-200 border ${
      isOfficial 
        ? 'bg-[#101924]/60 border-emerald-500/30 hover:border-emerald-500/60' 
        : item.severity === 'CRITICAL'
        ? 'bg-[#151926]/90 border-rose-500/40 hover:border-rose-500/80 shadow-lg shadow-rose-950/20'
        : item.severity === 'HIGH'
        ? 'bg-[#151926]/80 border-amber-500/30 hover:border-amber-500/70'
        : 'bg-[#121622]/70 border-[#232F46] hover:border-[#334260]'
    }`}>
      
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {item.icon_url ? (
            <img 
              src={item.icon_url} 
              alt={item.name} 
              className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-white/5 flex items-center justify-center text-gray-500 shrink-0">
              {item.asset_type === 'MOBILE_APP' ? <Smartphone size={20} /> : <MessageSquare size={20} />}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-base leading-tight hover:text-blue-400 transition cursor-pointer" onClick={() => onInspect(item)}>
                {item.name}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                {item.platform}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-md">
              {item.developer_or_publisher} • <span className="text-gray-500">{item.handle_or_id}</span>
            </p>
          </div>
        </div>

        {/* Severity Badge / Score */}
        <div className="text-right shrink-0">
          {isOfficial ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle size={13} /> Verified Official
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                item.severity === 'CRITICAL' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : item.severity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {item.severity} {item.final_score}%
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">Composite Risk</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Snippet or Reason */}
      <p className="text-xs text-gray-300 line-clamp-2 mb-4 bg-black/20 p-2.5 rounded-xl border border-white/5">
        {isOfficial ? (
          <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
            <FileCheck size={13} /> {item.exclusion_reason}
          </span>
        ) : (
          item.description || "No public bio or description available for this asset."
        )}
      </p>

      {/* Signal Mini Indicators (Visual Pill Bar) */}
      {!isOfficial && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 pt-1">
          <div className="p-2 rounded-lg bg-[#0B0F17]/80 border border-white/5">
            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Name Lookalike</span>
              <span className="font-bold text-white">{item.breakdown.name_score}%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.breakdown.name_score >= 70 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                style={{ width: `${item.breakdown.name_score}%` }} 
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0B0F17]/80 border border-white/5">
            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Logo / PFP</span>
              <span className="font-bold text-white">{item.breakdown.pfp_score}%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.breakdown.pfp_score >= 70 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                style={{ width: `${item.breakdown.pfp_score}%` }} 
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0B0F17]/80 border border-white/5">
            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Bio Intent</span>
              <span className="font-bold text-white">{item.breakdown.desc_score}%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.breakdown.desc_score >= 70 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                style={{ width: `${item.breakdown.desc_score}%` }} 
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0B0F17]/80 border border-white/5">
            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Complaints</span>
              <span className="font-bold text-white">{item.breakdown.reports_score}%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.breakdown.reports_score >= 50 ? 'bg-rose-500' : 'bg-violet-500'}`} 
                style={{ width: `${item.breakdown.reports_score}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
        {item.external_url ? (
          <a 
            href={item.external_url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-gray-400 hover:text-white flex items-center gap-1 transition"
          >
            <ExternalLink size={13} /> Open Store / Profile
          </a>
        ) : <div />}

        <div className="flex items-center gap-2">
          {!isOfficial && (
            <button 
              onClick={() => onWhitelist(item)}
              className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Whitelist this asset"
            >
              Mark Legitimate
            </button>
          )}
          <button 
            onClick={() => onInspect(item)}
            className="px-3.5 py-1.5 rounded-xl font-medium bg-[#1F293D] hover:bg-[#2A3752] text-gray-100 flex items-center gap-1.5 transition border border-white/10"
          >
            <Eye size={13} /> Deep Inspect
          </button>
        </div>
      </div>

    </div>
  );
}
