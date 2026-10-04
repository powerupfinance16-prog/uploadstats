import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Flame, 
  Check, 
  Instagram, 
  AlertCircle,
  Plus,
  Clock,
  Palette
} from 'lucide-react';
import { Employee, Account, DailyRecord, ThemeMode, TileStyle } from '../types';
import { 
  formatDayOfWeek, 
  formatDateNumber, 
  formatDateMonth, 
  isToday, 
  isFuture
} from '../utils/dateUtils';

interface UploadMatrixProps {
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  dateRangeList: string[];
  searchQuery: string;
  selectedCampaignId: string;
  onOpenInspector: (params: { dateStr: string; employeeId?: string; accountId?: string }) => void;
  onAssignAccount: (accountId: string, employeeId: string) => void;
  onAddAccount: () => void;
  theme: ThemeMode;
  tileStyle: TileStyle;
  onTileStyleChange: (style: TileStyle) => void;
}

export const UploadMatrix: React.FC<UploadMatrixProps> = ({
  employees,
  accounts,
  records,
  dateRangeList,
  searchQuery,
  selectedCampaignId,
  onOpenInspector,
  onAssignAccount,
  onAddAccount,
  theme,
  tileStyle,
  onTileStyleChange,
}) => {
  const isLight = theme === 'light';

  // Expanded employee IDs for accordion rows
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({
    emp1: true,
  });

  const toggleExpand = (empId: string) => {
    setExpandedEmployees((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    employees.forEach((e) => { all[e.id] = true; });
    setExpandedEmployees(all);
  };

  const collapseAll = () => {
    setExpandedEmployees({});
  };

  // Filter accounts by campaign if selected
  const campaignFilteredAccounts = accounts.filter((acc) => {
    if (selectedCampaignId === 'all') return true;
    return acc.campaignId === selectedCampaignId;
  });

  // Filter employees and accounts by search query
  const searchLower = searchQuery.toLowerCase().trim();

  const filteredEmployees = employees.filter((emp) => {
    const empAccounts = campaignFilteredAccounts.filter((a) => a.employeeId === emp.id);
    if (selectedCampaignId !== 'all' && empAccounts.length === 0) return false;

    if (!searchLower) return true;
    if (emp.name.toLowerCase().includes(searchLower)) return true;
    return empAccounts.some((a) => a.username.toLowerCase().includes(searchLower));
  });

  const unassignedAccounts = campaignFilteredAccounts.filter((a) => !a.employeeId && (
    !searchLower || a.username.toLowerCase().includes(searchLower)
  ));

  // Cell color helper based on tileStyle and theme
  const getCellClasses = (isMet: boolean, isPartial: boolean, isZero: boolean) => {
    if (tileStyle === 'solid') {
      if (isMet) {
        return 'bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-500 hover:scale-[1.03]';
      }
      if (isPartial) {
        return isLight
          ? 'bg-amber-500 text-white font-bold shadow-xs hover:bg-amber-600 hover:scale-[1.03]'
          : 'bg-amber-500 text-slate-950 font-bold shadow-xs hover:bg-amber-400 hover:scale-[1.03]';
      }
      return isLight
        ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/80 hover:text-slate-700'
        : 'bg-slate-900/70 text-slate-500 border border-slate-800/80 hover:border-slate-700 hover:text-slate-300';
    }

    if (tileStyle === 'translucent') {
      if (isMet) {
        return isLight
          ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-200/80'
          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30';
      }
      if (isPartial) {
        return isLight
          ? 'bg-amber-100/90 text-amber-800 border border-amber-300 font-bold hover:bg-amber-200/80'
          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30';
      }
      return isLight
        ? 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 hover:text-slate-600'
        : 'bg-slate-950/50 text-slate-500 border border-slate-800/80 hover:border-slate-700 hover:text-slate-400';
    }

    // Minimal style
    if (isMet) {
      return isLight
        ? 'bg-white border-2 border-emerald-500 text-emerald-700 font-bold'
        : 'bg-slate-900 border-2 border-emerald-500 text-emerald-400 font-bold';
    }
    if (isPartial) {
      return isLight
        ? 'bg-white border-2 border-amber-500 text-amber-700 font-bold'
        : 'bg-slate-900 border-2 border-amber-500 text-amber-400 font-bold';
    }
    return isLight
      ? 'bg-slate-100 text-slate-400 border border-slate-200'
      : 'bg-slate-950 text-slate-600 border border-slate-800';
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors shadow-xl flex flex-col ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900' 
        : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      
      {/* Table Subheader: Title, Tile Style Selector & Legend */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-950/70 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            Upload Habit Grid
          </span>
          <span className="text-slate-400">·</span>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Click any cell to edit clips
          </span>
        </div>

        {/* Tile Color Style Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Color Style:</span>
          </div>
          <div className={`inline-flex p-0.5 rounded-lg border text-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => onTileStyleChange('solid')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                tileStyle === 'solid'
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => onTileStyleChange('translucent')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                tileStyle === 'translucent'
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Soft
            </button>
            <button
              onClick={() => onTileStyleChange('minimal')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                tileStyle === 'minimal'
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outline
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>Met Quota</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
              ½
            </span>
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>In Progress</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400'
            }`}>
              -
            </span>
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>Missed</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className={`text-[11px] font-medium transition-colors ${
                isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Expand All
            </button>
            <span className="text-slate-400">/</span>
            <button
              onClick={collapseAll}
              className={`text-[11px] font-medium transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Main Matrix Scroll Container */}
      <div className="overflow-x-auto relative max-h-[calc(100vh-280px)]">
        <table className="w-full text-left border-collapse select-none">
          
          {/* Sticky Header with Dates */}
          <thead className={`sticky top-0 z-20 border-b shadow-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <tr>
              {/* Column 1: Creator / Account info (Sticky Left) */}
              <th className={`sticky left-0 z-30 px-4 py-3 min-w-[240px] max-w-[280px] border-r shadow-[2px_0_5px_rgba(0,0,0,0.06)] ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}>
                <div className="text-xs font-bold">
                  Creator & Accounts
                </div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Target / Day
                </div>
              </th>

              {/* Columns 2..N: Dates */}
              {dateRangeList.map((dateStr) => {
                const today = isToday(dateStr);
                const dayOfWeek = formatDayOfWeek(dateStr);
                const dayNum = formatDateNumber(dateStr);
                const monthName = formatDateMonth(dateStr);
                const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';

                return (
                  <th
                    key={dateStr}
                    className={`px-2 py-2 min-w-[56px] text-center border-r transition-colors ${
                      today 
                        ? isLight
                          ? 'bg-emerald-50 border-x-2 border-emerald-500 text-emerald-950 relative'
                          : 'bg-emerald-950/40 border-x-2 border-emerald-500/80 text-white relative' 
                        : isWeekend 
                          ? isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
                          : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800/80'
                    }`}
                  >
                    {today && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 rounded shadow-xs">
                        Today
                      </span>
                    )}
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${
                      today 
                        ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                        : isWeekend 
                          ? 'text-slate-500 dark:text-slate-400' 
                          : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {dayOfWeek}
                    </div>
                    <div className={`text-xs tabular-nums font-bold leading-tight ${
                      today 
                        ? 'text-emerald-700 dark:text-emerald-300 text-sm' 
                        : isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      {dayNum}
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 leading-none">
                      {monthName}
                    </div>
                  </th>
                );
              })}

              {/* Summary Columns */}
              <th className={`px-3 py-2 text-center min-w-[68px] border-l text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div>Total</div>
                <div className="text-[10px] text-slate-400 font-normal">Clips</div>
              </th>
              <th className={`px-3 py-2 text-center min-w-[68px] border-l text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div>Quota %</div>
                <div className="text-[10px] text-slate-400 font-normal">Met</div>
              </th>
              <th className={`px-3 py-2 text-center min-w-[64px] border-l text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div>Streak</div>
                <div className="text-[10px] text-slate-400 font-normal">Active</div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={`divide-y text-xs ${
            isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'
          }`}>
            {filteredEmployees.map((emp) => {
              const empAccounts = campaignFilteredAccounts.filter((a) => a.employeeId === emp.id);
              const isExpanded = expandedEmployees[emp.id] ?? false;
              const dailyTarget = empAccounts.reduce((sum, a) => sum + a.targetDailyClips, 0);

              // Calculate summary stats across selected date range
              let periodUploaded = 0;
              let daysMet = 0;
              let currentStreak = 0;
              let streakBroken = false;

              for (let i = dateRangeList.length - 1; i >= 0; i--) {
                const dateStr = dateRangeList[i];
                if (isFuture(dateStr)) continue;

                let dayUploaded = 0;
                empAccounts.forEach((acc) => {
                  const rec = records[`${dateStr}_${acc.id}`];
                  if (rec) dayUploaded += rec.uploadedClips;
                });

                periodUploaded += dayUploaded;

                if (dailyTarget > 0 && dayUploaded >= dailyTarget) {
                  daysMet++;
                  if (!streakBroken) {
                    currentStreak++;
                  }
                } else {
                  streakBroken = true;
                }
              }

              const quotaMetPct = dateRangeList.length > 0 
                ? Math.round((daysMet / dateRangeList.length) * 100) 
                : 0;

              return (
                <React.Fragment key={emp.id}>
                  {/* Parent Employee Row */}
                  <tr className={`transition-colors group ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                  }`}>
                    
                    {/* Sticky Creator Cell */}
                    <td className={`sticky left-0 z-10 px-4 py-3 border-r shadow-[2px_0_5px_rgba(0,0,0,0.06)] ${
                      isLight 
                        ? 'bg-white group-hover:bg-slate-50 border-slate-200' 
                        : 'bg-slate-900 group-hover:bg-slate-850 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleExpand(emp.id)}
                          className={`p-1 rounded transition-colors ${
                            isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                          }`}
                          aria-label={isExpanded ? 'Collapse accounts' : 'Expand accounts'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {/* Avatar */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: emp.color || '#10B981' }}
                        >
                          {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>

                        {/* Name and Info */}
                        <div className="truncate">
                          <div className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {emp.name}
                          </div>
                          <div className="text-[11px] flex items-center gap-1.5">
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                              {empAccounts.length} {empAccounts.length === 1 ? 'account' : 'accounts'}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                              {dailyTarget}/day
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Habit Cells */}
                    {dateRangeList.map((dateStr) => {
                      const today = isToday(dateStr);
                      let dayUploaded = 0;
                      empAccounts.forEach((acc) => {
                        const rec = records[`${dateStr}_${acc.id}`];
                        if (rec) dayUploaded += rec.uploadedClips;
                      });

                      const isMet = dailyTarget > 0 && dayUploaded >= dailyTarget;
                      const isPartial = dailyTarget > 0 && dayUploaded > 0 && dayUploaded < dailyTarget;
                      const isZero = dayUploaded === 0;

                      const cellStyleClasses = getCellClasses(isMet, isPartial, isZero);

                      return (
                        <td
                          key={dateStr}
                          onClick={() => onOpenInspector({ dateStr, employeeId: emp.id })}
                          className={`p-1 text-center cursor-pointer border-r transition-all ${
                            isLight ? 'border-slate-200' : 'border-slate-800/80'
                          } ${
                            today ? (isLight ? 'bg-emerald-50/60' : 'bg-emerald-950/20') : ''
                          }`}
                        >
                          <div
                            className={`h-9 w-full rounded-lg flex flex-col items-center justify-center transition-all ${cellStyleClasses}`}
                            title={`${emp.name} on ${dateStr}: ${dayUploaded}/${dailyTarget} clips. Click to adjust.`}
                          >
                            <span className="font-extrabold tabular-nums text-xs leading-none flex items-center gap-0.5">
                              {dayUploaded}
                              {isMet && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="text-[9px] opacity-80 tabular-nums leading-none mt-0.5">
                              /{dailyTarget}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Summary: Total Clips */}
                    <td className={`px-3 py-2 text-center border-l font-bold tabular-nums ${
                      isLight ? 'border-slate-200 text-slate-800' : 'border-slate-800 text-slate-200'
                    }`}>
                      {periodUploaded}
                    </td>

                    {/* Summary: Quota % */}
                    <td className={`px-3 py-2 text-center border-l tabular-nums ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <span className={`font-bold ${
                        quotaMetPct >= 80 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : quotaMetPct >= 50 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-rose-500'
                      }`}>
                        {quotaMetPct}%
                      </span>
                    </td>

                    {/* Summary: Streak */}
                    <td className={`px-3 py-2 text-center border-l tabular-nums ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      {currentStreak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold text-[11px]">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          <span>{currentStreak}d</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                  </tr>

                  {/* Accordion: Nested Account Rows for this Creator */}
                  {isExpanded && empAccounts.map((acc) => {
                    let accPeriodUploaded = 0;
                    let accDaysMet = 0;

                    dateRangeList.forEach((dateStr) => {
                      const rec = records[`${dateStr}_${acc.id}`];
                      const upl = rec ? rec.uploadedClips : 0;
                      accPeriodUploaded += upl;
                      if (upl >= acc.targetDailyClips) {
                        accDaysMet++;
                      }
                    });

                    const accQuotaPct = dateRangeList.length > 0 
                      ? Math.round((accDaysMet / dateRangeList.length) * 100) 
                      : 0;

                    return (
                      <tr 
                        key={acc.id} 
                        className={`transition-colors text-[11px] group/account border-t ${
                          isLight 
                            ? 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70' 
                            : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/40'
                        }`}
                      >
                        {/* Nested Account Header */}
                        <td className={`sticky left-0 z-10 pl-11 pr-4 py-2 border-r shadow-[2px_0_5px_rgba(0,0,0,0.06)] ${
                          isLight 
                            ? 'bg-slate-50/90 group-hover/account:bg-slate-100 border-slate-200' 
                            : 'bg-slate-950/90 group-hover/account:bg-slate-900 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                              <span className={`font-semibold truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                {acc.username}
                              </span>
                            </div>
                            <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded border ${
                              isLight 
                                ? 'bg-white border-slate-200 text-slate-600' 
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}>
                              {acc.targetDailyClips}/day
                            </span>
                          </div>
                        </td>

                        {/* Account Date Habit Cells */}
                        {dateRangeList.map((dateStr) => {
                          const today = isToday(dateStr);
                          const rec = records[`${dateStr}_${acc.id}`];
                          const uploaded = rec ? rec.uploadedClips : 0;
                          const target = acc.targetDailyClips;

                          const isMet = target > 0 && uploaded >= target;
                          const isPartial = target > 0 && uploaded > 0 && uploaded < target;
                          const isZero = uploaded === 0;

                          return (
                            <td
                              key={dateStr}
                              onClick={() => onOpenInspector({ dateStr, accountId: acc.id, employeeId: emp.id })}
                              className={`p-1 text-center cursor-pointer border-r ${
                                isLight ? 'border-slate-200' : 'border-slate-800/60'
                              } ${
                                today ? (isLight ? 'bg-emerald-50/50' : 'bg-emerald-950/15') : ''
                              }`}
                            >
                              <div
                                className={`h-7 w-full rounded flex items-center justify-center transition-all ${
                                  isMet
                                    ? isLight
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                      : 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40'
                                    : isPartial
                                      ? isLight
                                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                                        : 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                                      : isLight
                                        ? 'bg-slate-100 text-slate-400 hover:text-slate-700'
                                        : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'
                                }`}
                                title={`${acc.username} on ${dateStr}: ${uploaded}/${target} clips`}
                              >
                                <span className="tabular-nums font-mono text-[11px]">
                                  {uploaded > 0 ? `${uploaded}/${target}` : '-'}
                                </span>
                              </div>
                            </td>
                          );
                        })}

                        {/* Account Total */}
                        <td className={`px-3 py-1.5 text-center border-l font-mono tabular-nums ${
                          isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                        }`}>
                          {accPeriodUploaded}
                        </td>

                        {/* Account Quota Met */}
                        <td className={`px-3 py-1.5 text-center border-l font-mono tabular-nums ${
                          isLight ? 'border-slate-200' : 'border-slate-800'
                        }`}>
                          <span className={accQuotaPct >= 80 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                            {accQuotaPct}%
                          </span>
                        </td>

                        <td className={`px-3 py-1.5 text-center border-l text-slate-400 ${
                          isLight ? 'border-slate-200' : 'border-slate-800'
                        }`}>
                          -
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Unassigned Pages Section */}
            {unassignedAccounts.length > 0 && (
              <React.Fragment>
                {/* Unassigned Section Divider Header */}
                <tr className={isLight ? 'bg-amber-50 border-t-2 border-amber-300' : 'bg-amber-950/20 border-t-2 border-amber-500/30'}>
                  <td
                    colSpan={dateRangeList.length + 4}
                    className={`px-4 py-2.5 text-xs font-bold ${isLight ? 'text-amber-900' : 'text-amber-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>Unassigned Accounts ({unassignedAccounts.length})</span>
                        <span className={`text-[11px] font-normal ${isLight ? 'text-amber-700' : 'text-amber-400/70'}`}>
                          These pages have no active creator assigned
                        </span>
                      </div>
                      <button
                        onClick={onAddAccount}
                        className="text-[11px] text-amber-600 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New Page</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {unassignedAccounts.map((acc) => {
                  let accPeriodUploaded = 0;
                  dateRangeList.forEach((dateStr) => {
                    const rec = records[`${dateStr}_${acc.id}`];
                    accPeriodUploaded += rec ? rec.uploadedClips : 0;
                  });

                  return (
                    <tr
                      key={acc.id}
                      className={`transition-colors text-xs border-t ${
                        isLight 
                          ? 'bg-white hover:bg-slate-50 border-slate-200' 
                          : 'bg-slate-950/40 hover:bg-slate-900/60 border-slate-800/60'
                      }`}
                    >
                      {/* Left Sticky Column with Assign Editor dropdown */}
                      <td className={`sticky left-0 z-10 px-4 py-2.5 border-r shadow-[2px_0_5px_rgba(0,0,0,0.06)] ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <Instagram className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="truncate">
                              <div className={`font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                {acc.username}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Target: {acc.targetDailyClips}/day
                              </div>
                            </div>
                          </div>

                          {/* Quick Assign Dropdown */}
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                onAssignAccount(acc.id, e.target.value);
                              }
                            }}
                            className={`text-[11px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                              isLight 
                                ? 'bg-slate-100 border border-slate-300 text-slate-800' 
                                : 'bg-slate-950 border border-slate-700/80 text-slate-300'
                            }`}
                          >
                            <option value="" disabled>
                              + Assign Editor
                            </option>
                            {employees.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Unassigned Date Cells */}
                      {dateRangeList.map((dateStr) => {
                        const today = isToday(dateStr);
                        const rec = records[`${dateStr}_${acc.id}`];
                        const uploaded = rec ? rec.uploadedClips : 0;
                        const target = acc.targetDailyClips;
                        const isMet = target > 0 && uploaded >= target;
                        const isPartial = target > 0 && uploaded > 0 && uploaded < target;

                        return (
                          <td
                            key={dateStr}
                            onClick={() => onOpenInspector({ dateStr, accountId: acc.id })}
                            className={`p-1 text-center cursor-pointer border-r ${
                              isLight ? 'border-slate-200' : 'border-slate-800/60'
                            } ${
                              today ? (isLight ? 'bg-emerald-50/50' : 'bg-emerald-950/15') : ''
                            }`}
                          >
                            <div
                              className={`h-7 w-full rounded flex items-center justify-center transition-all ${
                                isMet
                                  ? isLight ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                                  : isPartial
                                    ? isLight ? 'bg-amber-500 text-white font-bold' : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                    : isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              <span className="tabular-nums font-mono text-[11px]">
                                {uploaded > 0 ? `${uploaded}/${target}` : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className={`px-3 py-2 text-center border-l font-mono tabular-nums ${
                        isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'
                      }`}>
                        {accPeriodUploaded}
                      </td>

                      <td className={`px-3 py-2 text-center border-l text-slate-400 ${
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        -
                      </td>

                      <td className={`px-3 py-2 text-center border-l text-slate-400 ${
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        -
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            )}

            {filteredEmployees.length === 0 && unassignedAccounts.length === 0 && (
              <tr>
                <td
                  colSpan={dateRangeList.length + 4}
                  className="px-6 py-12 text-center text-slate-400 text-xs"
                >
                  No team members or Instagram accounts match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Summary Info */}
      <div className={`px-5 py-2.5 border-t flex flex-wrap items-center justify-between text-xs ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <div>
          Showing <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{filteredEmployees.length}</span> creators ·{' '}
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{campaignFilteredAccounts.length}</span> accounts
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time persistence enabled · Auto-synced</span>
        </div>
      </div>

    </div>
  );
};
