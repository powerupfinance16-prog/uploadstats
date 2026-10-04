import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  MoreVertical, 
  Plus, 
  Share2, 
  Copy, 
  RotateCcw, 
  Instagram, 
  Users, 
  Sparkles,
  Check
} from 'lucide-react';
import { DateRangeType, ThemeMode, Campaign } from '../types';

interface DashboardHeaderProps {
  range: DateRangeType;
  onRangeChange: (r: DateRangeType) => void;
  dateRangeList: string[];
  theme: ThemeMode;
  onOpenMemberShare: () => void;
  onCopyWhatsApp: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenAddAccount: () => void;
  onOpenAddEmployee: () => void;
  onResetData: () => void;
  copyFeedback: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  range,
  onRangeChange,
  dateRangeList,
  theme,
  onOpenMemberShare,
  onCopyWhatsApp,
  onOpenWhatsAppModal,
  onOpenAddAccount,
  onOpenAddEmployee,
  onResetData,
  copyFeedback,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isLight = theme === 'light';

  // Format date range string: e.g. "Sep 20, 2026 – Oct 03, 2026"
  const dateRangeString = React.useMemo(() => {
    if (dateRangeList.length === 0) return 'Select Date Range';
    const first = dateRangeList[0];
    const last = dateRangeList[dateRangeList.length - 1];

    const formatDate = (dStr: string) => {
      const [y, m, d] = dStr.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    return `${formatDate(first)} – ${formatDate(last)}`;
  }, [dateRangeList]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className={`text-xl lg:text-2xl font-bold tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Team Video Upload Matrix
        </h1>
        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Track daily uploads, quotas and consistency across all creators.
        </p>
      </div>

      {/* Right Controls: Date Pill, 7D/14D/30D/Month, Three dots ⋮ */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Date Range Display Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
          isLight 
            ? 'bg-white border-slate-200/90 text-slate-700' 
            : 'bg-[#121214] border-zinc-800 text-zinc-300'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{dateRangeString}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
        </div>

        {/* Segmented Range Tabs: Daily | 4D | 7D | 14D | 30D */}
        <div className={`inline-flex p-0.5 rounded-xl border ${
          isLight 
            ? 'bg-white border-slate-200/90 shadow-2xs' 
            : 'bg-[#121214] border-zinc-800'
        }`}>
          {[
            { id: '1', label: 'Daily' },
            { id: '4', label: '4D' },
            { id: '7', label: '7D' },
            { id: '14', label: '14D' },
            { id: '30', label: '30D' },
          ].map((tab) => {
            const isActive = range === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onRangeChange(tab.id as DateRangeType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Three dots action menu ⋮ */}
        <div className="relative">
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-100 shadow-2xs'
                : 'bg-[#121214] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="More Actions & Tools"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {moreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreMenuOpen(false)}
              />
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-1.5 z-50 border animate-in fade-in zoom-in-95 duration-100 ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}>
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenMemberShare();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 ${
                    isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Share Creator Daily Brief</span>
                </button>

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onCopyWhatsApp();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 ${
                    isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      <span className="text-emerald-600 font-bold">Copied WhatsApp Report!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy WhatsApp Report</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenWhatsAppModal();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 ${
                    isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Report Generator</span>
                </button>

                <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`} />

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenAddAccount();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 ${
                    isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Add Instagram Account</span>
                </button>

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenAddEmployee();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 ${
                    isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Add Team Member</span>
                </button>

                <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`} />

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onResetData();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 flex items-center gap-2.5"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <span>Reset to Sample Data</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
