import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Filter, 
  Calendar, 
  Sparkles, 
  RotateCcw, 
  Search,
  Users,
  Instagram,
  ChevronDown,
  DollarSign,
  Sun,
  Moon
} from 'lucide-react';
import { Campaign, DateRangeType, ThemeMode } from '../types';

interface HeaderProps {
  range: DateRangeType;
  onRangeChange: (range: DateRangeType) => void;
  campaigns: Campaign[];
  selectedCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onCopyWhatsApp: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenAddAccount: () => void;
  onOpenAddEmployee: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showPayouts: boolean;
  onTogglePayouts: () => void;
  copyFeedback: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenMemberShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  range,
  onRangeChange,
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
  onCopyWhatsApp,
  onOpenWhatsAppModal,
  onOpenAddAccount,
  onOpenAddEmployee,
  onResetData,
  searchQuery,
  onSearchChange,
  showPayouts,
  onTogglePayouts,
  copyFeedback,
  theme,
  onToggleTheme,
  onOpenMemberShare,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';

  return (
    <header className={`border-b sticky top-0 z-30 px-4 lg:px-8 py-3 backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs' 
        : 'bg-[#0B0F17]/95 border-slate-800/90 text-slate-100'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Brand & Title with Habit Tracker Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-base tracking-tight">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                Team Video Upload Matrix
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full border ${
                isLight 
                  ? 'bg-sky-50 text-sky-700 border-sky-200' 
                  : 'bg-sky-950/40 text-sky-400 border-sky-800/60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Habit Tracker
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Daily quota cadence & consistency monitor across Instagram creators
            </p>
          </div>
        </div>

        {/* Controls: Search, Campaign filter, Range Tabs, WhatsApp, Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search creator or @handle..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-36 md:w-44 transition-all ${
                isLight 
                  ? 'bg-slate-100/80 border border-slate-200 text-slate-800 focus:bg-white' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 focus:border-sky-500/70'
              }`}
            />
          </div>

          {/* Campaign Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedCampaignId}
              onChange={(e) => onSelectCampaign(e.target.value)}
              aria-label="Filter by campaign"
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                isLight 
                  ? 'bg-slate-100/80 border border-slate-200 text-slate-800 hover:bg-slate-200/70' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 hover:bg-slate-850'
              }`}
            >
              <option value="all">All Campaigns ({campaigns.length})</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.clientName})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Date Range Tabs: 3 Days (Clean Default) | Week | 14 Days | Month */}
          <div className={`inline-flex p-0.5 rounded-lg border ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {(['3', '7', '14', '30'] as const).map((r) => {
              const label = r === '3' ? '3 Days' : r === '7' ? 'Week (7D)' : r === '14' ? '14 Days' : 'Month (30D)';
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => onRangeChange(r)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                    active
                      ? isLight
                        ? 'bg-white text-sky-700 font-semibold shadow-xs'
                        : 'bg-sky-600 text-white font-semibold shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 font-medium'
                        : 'text-slate-400 hover:text-slate-200 font-medium'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Payouts / Compensation Toggle */}
          <button
            onClick={onTogglePayouts}
            title="Toggle compensation estimate view"
            className={`p-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1 ${
              showPayouts
                ? isLight 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : isLight 
                  ? 'bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200/80' 
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Payouts</span>
          </button>

          {/* Theme Toggle Button: Light / Dark */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium ${
              isLight
                ? 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* 1-Click WhatsApp Daily Report Button Group */}
          <div className="inline-flex rounded-lg shadow-xs">
            <button
              onClick={onCopyWhatsApp}
              className={`px-3 py-1.5 text-xs font-semibold rounded-l-lg transition-all flex items-center gap-1.5 border border-r-0 ${
                copyFeedback
                  ? 'bg-sky-600 text-white border-sky-600'
                  : isLight
                    ? 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700'
                    : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-600'
              }`}
              title="Copy Today's WhatsApp Summary to clipboard"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>WhatsApp Report</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenWhatsAppModal}
              className={`px-2 py-1.5 text-xs rounded-r-lg border transition-all ${
                isLight
                  ? 'bg-sky-700 text-white border-sky-700 hover:bg-sky-800'
                  : 'bg-sky-700 text-white border-sky-700 hover:bg-sky-600'
              }`}
              title="Preview / Select date for WhatsApp report"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Individual Member Share Card Button */}
          <button
            onClick={onOpenMemberShare}
            title="Generate & Share Creator Daily Performance Graphic Card"
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              isLight
                ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Member Card</span>
          </button>

          {/* Action Dropdown: Add Account / Employee / Reset */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className={`absolute right-0 mt-1.5 w-52 rounded-xl shadow-2xl py-1 z-50 border animate-in fade-in zoom-in-95 duration-100 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenMemberShare();
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Share Member Daily Card</span>
                  </button>
                  <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAddAccount();
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Add Instagram Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAddEmployee();
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Add Team Member</span>
                  </button>
                  <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onResetData();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset to Default Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
