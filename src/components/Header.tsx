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
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';

  return (
    <header className={`border-b sticky top-0 z-30 px-4 lg:px-8 py-3.5 backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs' 
        : 'bg-slate-900/95 border-slate-800 text-slate-100'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Brand & Title with Habit Tracker Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-lg">
            F
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Team Video Upload Matrix
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Habit Tracker
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Daily quota cadence & consistency monitor across Instagram creators
            </p>
          </div>
        </div>

        {/* Controls: Search, Campaign filter, Range Tabs, WhatsApp, Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              placeholder="Search creator or @handle..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-40 md:w-48 transition-all ${
                isLight 
                  ? 'bg-slate-100 border border-slate-200 text-slate-800 focus:bg-white' 
                  : 'bg-slate-950/70 border border-slate-800 text-slate-200 focus:border-emerald-500/60'
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
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isLight 
                  ? 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200/70' 
                  : 'bg-slate-950/70 border border-slate-800 text-slate-200 hover:bg-slate-800/80'
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

          {/* Date Range Tabs: 7 Days | 14 Days (Default) | 30 Days | This Month */}
          <div className={`inline-flex p-0.5 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {(['7', '14', '30', 'month'] as const).map((r) => {
              const label = r === 'month' ? 'This Month' : `${r} Days`;
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => onRangeChange(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    active
                      ? isLight
                        ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                        : 'bg-emerald-500 text-white shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
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
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isLight 
                  ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80' 
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
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
                ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                : 'bg-slate-950/80 text-amber-300 border-slate-800 hover:border-slate-700'
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
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isLight
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title="Copy Today's WhatsApp Summary to clipboard"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
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
                  ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title="Preview / Select date for WhatsApp report"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

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
                <div className={`absolute right-0 mt-1.5 w-48 rounded-xl shadow-2xl py-1 z-50 border animate-in fade-in zoom-in-95 duration-100 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}>
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
