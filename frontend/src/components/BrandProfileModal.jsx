import React, { useState } from 'react';
import { Building2, Plus, ShieldCheck, Globe, Smartphone, AtSign } from 'lucide-react';

export default function BrandProfileModal({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState({
    brand_name: profile?.brand_name || '',
    official_logo_url: profile?.official_logo_url || '',
    trademark_terms: profile?.trademark_terms?.join(', ') || '',
    official_domains: profile?.official_domains?.join(', ') || '',
    official_handles: profile?.official_handles?.join(', ') || '',
    official_app_ids: profile?.official_app_ids?.join(', ') || '',
    official_publishers: profile?.official_publishers?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      brand_name: formData.brand_name.trim(),
      official_logo_url: formData.official_logo_url.trim(),
      trademark_terms: formData.trademark_terms.split(',').map(s => s.trim()).filter(Boolean),
      official_domains: formData.official_domains.split(',').map(s => s.trim()).filter(Boolean),
      official_handles: formData.official_handles.split(',').map(s => s.trim()).filter(Boolean),
      official_app_ids: formData.official_app_ids.split(',').map(s => s.trim()).filter(Boolean),
      official_publishers: formData.official_publishers.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121824] border border-[#232F46] rounded-2xl shadow-2xl p-6 text-gray-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#232F46] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Brand Ground-Truth Profile</h2>
              <p className="text-xs text-gray-400">Define legitimate assets used to guide detection and exclude official accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Company / Brand Name *</label>
            <input 
              type="text" 
              required
              value={formData.brand_name} 
              onChange={e => setFormData({...formData, brand_name: e.target.value})}
              placeholder="e.g. Binance"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Official Logo Image URL</label>
            <input 
              type="url" 
              value={formData.official_logo_url} 
              onChange={e => setFormData({...formData, official_logo_url: e.target.value})}
              placeholder="https://.../logo.png"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-400" /> Authorized Domains (comma-separated)
              </label>
              <input 
                type="text" 
                value={formData.official_domains} 
                onChange={e => setFormData({...formData, official_domains: e.target.value})}
                placeholder="binance.com, binance.us"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                <AtSign size={13} className="text-indigo-400" /> Official Social Handles (comma-separated)
              </label>
              <input 
                type="text" 
                value={formData.official_handles} 
                onChange={e => setFormData({...formData, official_handles: e.target.value})}
                placeholder="@binance, @binancehelpdesk, r/binance"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                <Smartphone size={13} className="text-amber-400" /> Official App Store IDs (Bundle/Package IDs)
              </label>
              <input 
                type="text" 
                value={formData.official_app_ids} 
                onChange={e => setFormData({...formData, official_app_ids: e.target.value})}
                placeholder="com.binance.dev, id1436799971"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Authorized Publishers / Developers
              </label>
              <input 
                type="text" 
                value={formData.official_publishers} 
                onChange={e => setFormData({...formData, official_publishers: e.target.value})}
                placeholder="Binance Ltd., Binance"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#232F46] rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#232F46] flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Save Ground Truth Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
