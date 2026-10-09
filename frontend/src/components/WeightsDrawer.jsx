import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

export default function WeightsDrawer({ weights, onChange, onReset, onClose }) {
  if (!weights) return null;

  const weightFields = [
    { key: 'desc', label: 'Bio / Description Resemblance', desc: 'Weight for trademark phrase matches & scam intent' },
    { key: 'pfp', label: 'Logo / Icon Perceptual Hash', desc: 'Visual similarity between official brand logo & candidate' },
    { key: 'name', label: 'Look-alike Name Engine', desc: 'Bonus engine: character swaps, spacing, and homoglyphs' },
    { key: 'reports', label: 'Community Complaints & Reports', desc: '1-star scam review clusters & public fraud accusations' },
    { key: 'publisher', label: 'Developer / Publisher Mismatch', desc: 'App Store publisher differs from official registered entity' },
    { key: 'link', label: 'Suspicious Domain / Redirects', desc: 'Links to Telegram, shorteners, or unverified domains' }
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#121824] border border-[#232F46] mb-6 animate-fade-in shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#232F46] mb-4">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-white text-sm">Dynamic Risk Weight Customizer</h3>
          <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">Transparent Scoring</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <RotateCcw size={12} /> Reset Defaults
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs px-2 py-1">
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weightFields.map(f => (
          <div key={f.key} className="p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-200 font-medium">{f.label}</span>
              <span className="text-indigo-400 font-mono font-bold">{Math.round((weights[f.key] || 0) * 100)}%</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">{f.desc}</p>
            <input 
              type="range" 
              min="0" 
              max="0.50" 
              step="0.05"
              value={weights[f.key] || 0}
              onChange={(e) => onChange(f.key, parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
