import React, { useState } from 'react';
import { X, Instagram, Plus } from 'lucide-react';
import { Account, Campaign, Employee } from '../types';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  employees: Employee[];
  campaigns: Campaign[];
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  employees,
  campaigns,
}) => {
  const [username, setUsername] = useState('');
  const [targetDailyClips, setTargetDailyClips] = useState(3);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>(campaigns[0]?.id || 'camp1');
  const [niche, setNiche] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    let cleanUsername = username.trim();
    if (!cleanUsername.startsWith('@')) {
      cleanUsername = `@${cleanUsername}`;
    }

    onAddAccount({
      username: cleanUsername,
      targetDailyClips: Number(targetDailyClips) || 1,
      employeeId: employeeId || undefined,
      campaignId,
      niche: niche.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Instagram className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Add Instagram Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Handle / Username *
            </label>
            <input
              type="text"
              required
              placeholder="@brand_reels"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Clips / Day *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={targetDailyClips}
                onChange={(e) => setTargetDailyClips(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Creator
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Leave Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Campaign / Project *
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Content Niche
              </label>
              <input
                type="text"
                placeholder="e.g. AI Clips, Fitness"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
