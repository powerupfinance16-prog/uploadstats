import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronDown, 
  Instagram, 
  Check, 
  Share2,
  Filter
} from 'lucide-react';
import { Employee, Account, DailyRecord, ThemeMode } from '../types';
import { 
  formatDateNumber, 
  formatDateMonth, 
  isToday 
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
  onShareMember: (employeeId: string, dateStr?: string) => void;
}

export const UploadMatrix: React.FC<UploadMatrixProps> = ({
  employees,
  accounts,
  records,
  dateRangeList,
  onOpenInspector,
  theme,
  onShareMember,
}) => {
  const isLight = theme === 'light';

  // Toggle expanded states per employee (default first is expanded as in screenshot)
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({
    [employees[0]?.id || 'emp-1']: true,
  });

  const [accountFilter, setAccountFilter] = useState<string>('all');

  const toggleExpand = (empId: string) => {
    setExpandedEmployees((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  // Helper for Circular Consistency Ring SVG
  const renderConsistencyRing = (percentage: number) => {
    const radius = 11;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

    const strokeColor = percentage >= 80 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444';

    return (
      <div className="flex items-center justify-center gap-1.5">
        <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="transparent"
              stroke={isLight ? '#F1F5F9' : '#27272A'}
              strokeWidth="3"
            />
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className={`text-[11px] font-bold tabular-nums ${
          percentage >= 80 
            ? 'text-emerald-500 dark:text-emerald-400' 
            : percentage >= 50 
              ? 'text-amber-500 dark:text-amber-400' 
              : 'text-rose-500 dark:text-rose-400'
        }`}>
          {percentage}%
        </span>
      </div>
    );
  };

  const filteredEmployees = employees;

  return (
    <div className={`flex-1 min-h-0 rounded-xl border transition-colors shadow-sm overflow-hidden flex flex-col ${
      isLight 
        ? 'bg-white border-slate-200/80 text-slate-900' 
        : 'bg-[#121214] border-zinc-800 text-zinc-100'
    }`}>
      
      {/* Table Header: Upload Matrix Title, Legend, Filter Dropdown */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight ? 'bg-white border-slate-100' : 'bg-[#18181B] border-zinc-800'
      }`}>
        
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Upload Matrix
            </h2>
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
              Click on any cell to edit uploads
            </span>
          </div>
        </div>

        {/* Right: Legend (Met Quota, In Progress, Missed) + Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px]">Met Quota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px]">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px]">Missed</span>
            </div>
          </div>

          <div className="relative">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className={`px-2.5 py-1 pr-7 rounded-lg border text-xs font-semibold appearance-none cursor-pointer transition-all ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.username}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Responsive Horizontal & Vertical Scroll Container for Table Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          
          {/* Table Head */}
          <thead className="sticky top-0 z-10">
            <tr className={`border-b text-xs font-semibold ${
              isLight ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-zinc-800 bg-[#18181B] text-zinc-400'
            }`}>
              
              {/* Creator Column */}
              <th className={`px-4 py-2.5 min-w-[200px] sticky left-0 z-20 ${isLight ? 'bg-slate-50' : 'bg-[#18181B]'}`}>
                <div className="font-bold text-slate-900 dark:text-zinc-100">Creator & Accounts</div>
                <div className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">Target / Day</div>
              </th>

              {/* Date Columns - NO Day of week (Sat/Sun removed!), only Date & Month */}
              {dateRangeList.map((dStr) => {
                const today = isToday(dStr);
                const dayNum = formatDateNumber(dStr);
                const month = formatDateMonth(dStr);

                return (
                  <th
                    key={dStr}
                    className={`px-2 py-2 text-center min-w-[62px] ${
                      today 
                        ? isLight 
                          ? 'bg-blue-50/80 border-x border-blue-200 text-blue-700 font-bold' 
                          : 'bg-zinc-800/80 border-x border-zinc-700 text-zinc-100 font-bold'
                        : ''
                    }`}
                  >
                    <div className={`text-xs font-bold leading-tight ${today ? 'text-blue-600 dark:text-zinc-100' : isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      {dayNum} {month}
                    </div>
                    {today ? (
                      <span className="inline-block text-[9px] font-bold tracking-tight uppercase px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:bg-emerald-500/20 dark:text-emerald-400 border dark:border-emerald-500/30 mt-0.5">
                        Today
                      </span>
                    ) : (
                      <span className="inline-block text-[9px] font-medium text-slate-400 dark:text-zinc-500 mt-0.5">
                        {dStr.slice(0, 4)}
                      </span>
                    )}
                  </th>
                );
              })}

              {/* Summary Columns */}
              <th className="px-3 py-2 text-center min-w-[60px]">
                <div className="font-bold text-slate-900 dark:text-zinc-100">Total</div>
                <div className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">Clips</div>
              </th>

              <th className="px-4 py-2 text-center min-w-[85px]">
                <div className="font-bold text-slate-900 dark:text-zinc-100">Consistency</div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={`divide-y text-xs ${
            isLight ? 'divide-slate-100' : 'divide-zinc-800/80'
          }`}>
            {filteredEmployees.map((emp) => {
              const isExpanded = !!expandedEmployees[emp.id];
              const empAccounts = accounts.filter((a) => a.employeeId === emp.id);
              const initials = emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('');

              // Calculate daily target
              const dailyTarget = empAccounts.reduce((sum, a) => sum + a.targetDailyClips, 0);

              // Calculate total period uploaded
              let periodUploaded = 0;
              let daysMet = 0;

              dateRangeList.forEach((dStr) => {
                let dayUp = 0;
                empAccounts.forEach((acc) => {
                  const rec = records[`${dStr}_${acc.id}`];
                  if (rec) dayUp += rec.uploadedClips;
                });
                periodUploaded += dayUp;
                if (dailyTarget > 0 && dayUp >= dailyTarget) {
                  daysMet++;
                }
              });

              const consistencyPct = dateRangeList.length > 0 
                ? Math.round((daysMet / dateRangeList.length) * 100) 
                : 0;

              return (
                <React.Fragment key={emp.id}>
                  
                  {/* Creator Parent Row */}
                  <tr className={`group transition-colors ${
                    isLight 
                      ? 'hover:bg-slate-50/70 bg-white' 
                      : 'hover:bg-[#18181B] bg-[#121214]'
                  }`}>
                    
                    {/* Creator Info Cell */}
                    <td className={`px-4 py-2.5 sticky left-0 z-10 ${
                      isLight ? 'bg-white group-hover:bg-slate-50' : 'bg-[#121214] group-hover:bg-[#18181B]'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleExpand(emp.id)}
                          className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs cursor-pointer"
                          style={{ backgroundColor: emp.color || '#10B981' }}
                          onClick={() => onShareMember(emp.id)}
                          title="Click to view & share Creator Daily Brief"
                        >
                          {initials}
                        </div>

                        {/* Name & Accounts info */}
                        <div className="truncate">
                          <div 
                            className="font-bold text-xs text-slate-900 dark:text-zinc-100 hover:text-blue-500 cursor-pointer flex items-center gap-1.5"
                            onClick={() => onShareMember(emp.id)}
                          >
                            <span>{emp.name}</span>
                            <Share2 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <span>{empAccounts.length} {empAccounts.length === 1 ? 'account' : 'accounts'}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-500 dark:text-emerald-400">{dailyTarget}/day</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Habit Cells */}
                    {dateRangeList.map((dStr) => {
                      const today = isToday(dStr);
                      let dayUp = 0;
                      empAccounts.forEach((acc) => {
                        const rec = records[`${dStr}_${acc.id}`];
                        if (rec) dayUp += rec.uploadedClips;
                      });

                      const isMet = dailyTarget > 0 && dayUp >= dailyTarget;
                      const isPartial = dailyTarget > 0 && dayUp > 0 && dayUp < dailyTarget;

                      return (
                        <td
                          key={dStr}
                          onClick={() => onOpenInspector({ dateStr: dStr, employeeId: emp.id })}
                          className={`px-1.5 py-1.5 text-center cursor-pointer ${
                            today ? (isLight ? 'bg-blue-50/50' : 'bg-zinc-800/20') : ''
                          }`}
                        >
                          <div
                            className={`mx-auto w-12 h-7 rounded-md flex items-center justify-center text-xs font-bold tabular-nums transition-transform hover:scale-105 ${
                              isMet
                                ? isLight 
                                  ? 'bg-[#DCFCE7] text-[#15803D]' 
                                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : isPartial
                                  ? isLight 
                                    ? 'bg-[#FFEDD5] text-[#C2410C]' 
                                    : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                                  : isLight 
                                    ? 'bg-[#F1F5F9] text-[#94A3B8]' 
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}
                            title={`${emp.name}: ${dayUp}/${dailyTarget} clips on ${dStr}. Click to adjust.`}
                          >
                            {dayUp > 0 ? `${dayUp}/${dailyTarget}` : `0/${dailyTarget}`}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Clips */}
                    <td className="px-3 py-2 text-center font-bold text-xs tabular-nums text-slate-800 dark:text-zinc-200">
                      {periodUploaded}
                    </td>

                    {/* Consistency Circular Ring */}
                    <td className="px-4 py-2 text-center">
                      {renderConsistencyRing(consistencyPct)}
                    </td>

                  </tr>

                  {/* Nested Instagram Account Rows (when expanded) */}
                  {isExpanded && empAccounts.map((acc) => {
                    let accPeriodUp = 0;
                    let accDaysMet = 0;

                    dateRangeList.forEach((dStr) => {
                      const rec = records[`${dStr}_${acc.id}`];
                      const up = rec ? rec.uploadedClips : 0;
                      accPeriodUp += up;
                      if (acc.targetDailyClips > 0 && up >= acc.targetDailyClips) {
                        accDaysMet++;
                      }
                    });

                    const accConsistencyPct = dateRangeList.length > 0 
                      ? Math.round((accDaysMet / dateRangeList.length) * 100) 
                      : 0;

                    return (
                      <tr 
                        key={acc.id}
                        className={`transition-colors ${
                          isLight 
                            ? 'bg-slate-50/40 hover:bg-slate-100/50' 
                            : 'bg-zinc-950/40 hover:bg-zinc-900/60'
                        }`}
                      >
                        {/* Account Name Cell */}
                        <td className={`pl-12 pr-4 py-1.5 sticky left-0 z-10 ${
                          isLight ? 'bg-slate-50/40' : 'bg-zinc-950/40'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-pink-950/30 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                              <Instagram className="w-3 h-3" />
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-xs text-slate-800 dark:text-zinc-300">
                                {acc.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Account Date Habit Cells */}
                        {dateRangeList.map((dStr) => {
                          const today = isToday(dStr);
                          const rec = records[`${dStr}_${acc.id}`];
                          const up = rec ? rec.uploadedClips : 0;
                          const tgt = acc.targetDailyClips;

                          const isMet = tgt > 0 && up >= tgt;
                          const isPartial = tgt > 0 && up > 0 && up < tgt;

                          return (
                            <td
                              key={dStr}
                              onClick={() => onOpenInspector({ dateStr: dStr, accountId: acc.id, employeeId: emp.id })}
                              className={`px-1.5 py-1 text-center cursor-pointer ${
                                today ? (isLight ? 'bg-blue-50/30' : 'bg-zinc-800/10') : ''
                              }`}
                            >
                              <div
                                className={`mx-auto w-11 h-6 rounded flex items-center justify-center text-[11px] font-semibold tabular-nums transition-transform hover:scale-105 ${
                                  isMet
                                    ? isLight 
                                      ? 'bg-[#DCFCE7] text-[#15803D]' 
                                      : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/25'
                                    : isPartial
                                      ? isLight 
                                        ? 'bg-[#FFEDD5] text-[#C2410C]' 
                                        : 'bg-amber-950/50 text-amber-400 border border-amber-500/25'
                                      : 'bg-transparent text-zinc-500'
                                }`}
                              >
                                {up > 0 ? `${up}/${tgt}` : '-'}
                              </div>
                            </td>
                          );
                        })}

                        {/* Account Total */}
                        <td className="px-3 py-1.5 text-center font-bold text-xs tabular-nums text-slate-700 dark:text-zinc-400">
                          {accPeriodUp}
                        </td>

                        {/* Account Consistency */}
                        <td className="px-4 py-1.5 text-center">
                          {renderConsistencyRing(accConsistencyPct)}
                        </td>
                      </tr>
                    );
                  })}

                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
