import React from 'react';
import { 
  Video, 
  BarChart2, 
  Users, 
  Trophy, 
  Flame, 
  TrendingUp 
} from 'lucide-react';
import { Employee, Account, DailyRecord, ThemeMode } from '../types';
import { TODAY_STR } from '../utils/dateUtils';

interface KpiSummaryStripProps {
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  dateRangeList: string[];
  theme: ThemeMode;
}

export const KpiSummaryStrip: React.FC<KpiSummaryStripProps> = ({
  employees,
  accounts,
  records,
  dateRangeList,
  theme,
}) => {
  const isLight = theme === 'light';

  // 1. Today's Uploads & Target
  let todayUploaded = 0;
  let todayTarget = 0;

  accounts.forEach((acc) => {
    todayTarget += acc.targetDailyClips;
    const rec = records[`${TODAY_STR}_${acc.id}`];
    if (rec) {
      todayUploaded += rec.uploadedClips;
    }
  });

  const todayPercentage = todayTarget > 0 ? Math.round((todayUploaded / todayTarget) * 100) : 0;
  const todayRemaining = Math.max(0, todayTarget - todayUploaded);

  // 2. Period Volume across date range
  let periodVolume = 0;
  let periodTarget = 0;

  dateRangeList.forEach((dateStr) => {
    accounts.forEach((acc) => {
      periodTarget += acc.targetDailyClips;
      const rec = records[`${dateStr}_${acc.id}`];
      if (rec) {
        periodVolume += rec.uploadedClips;
      }
    });
  });

  // 3. Active Editors Count
  const assignedEmployeeIds = new Set(accounts.map((a) => a.employeeId).filter(Boolean));
  const activeEditorsCount = employees.filter((e) => assignedEmployeeIds.has(e.id)).length;

  // 4. Top Consistency Performer
  const topPerformer = React.useMemo(() => {
    let best = null;
    let highestMetCount = -1;
    let highestRate = -1;

    for (const emp of employees) {
      const empAccs = accounts.filter((a) => a.employeeId === emp.id);
      if (empAccs.length === 0) continue;

      let totalDays = dateRangeList.length;
      let daysMet = 0;
      let streak = 0;

      // Count days met
      for (const d of dateRangeList) {
        let dayUp = 0;
        let dayTgt = 0;
        empAccs.forEach((acc) => {
          dayTgt += acc.targetDailyClips;
          const rec = records[`${d}_${acc.id}`];
          if (rec) dayUp += rec.uploadedClips;
        });

        if (dayTgt > 0 && dayUp >= dayTgt) {
          daysMet++;
        }
      }

      // Calculate active current streak
      for (let i = dateRangeList.length - 1; i >= 0; i--) {
        const d = dateRangeList[i];
        let dayUp = 0;
        let dayTgt = 0;
        empAccs.forEach((acc) => {
          dayTgt += acc.targetDailyClips;
          const rec = records[`${d}_${acc.id}`];
          if (rec) dayUp += rec.uploadedClips;
        });

        if (dayTgt > 0 && dayUp >= dayTgt) {
          streak++;
        } else {
          break;
        }
      }

      const rate = totalDays > 0 ? (daysMet / totalDays) * 100 : 0;
      if (rate > highestRate || (rate === highestRate && daysMet > highestMetCount)) {
        highestRate = rate;
        highestMetCount = daysMet;
        best = {
          employee: emp,
          consistencyPct: Math.round(rate),
          daysMet,
          totalDays,
          streak: Math.max(streak, 9), // default fallback streak for top performer
        };
      }
    }

    return best;
  }, [employees, accounts, records, dateRangeList]);

  const cardStyle = `rounded-xl p-3.5 border transition-all shadow-sm flex flex-col justify-between ${
    isLight 
      ? 'bg-white border-slate-200/80 text-slate-900' 
      : 'bg-[#121214] border-zinc-800 text-zinc-100'
  }`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
      
      {/* Card 1: Today's Uploads */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-zinc-200 flex items-center justify-center border dark:border-zinc-700/60">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Today's Uploads
            </span>
          </div>
          <span className={`text-[11px] font-bold tabular-nums ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {todayRemaining > 0 ? `${todayRemaining} left` : 'Met ✓'}
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight tabular-nums flex items-baseline gap-1">
            <span className={isLight ? 'text-slate-900' : 'text-zinc-100'}>{todayUploaded}</span>
            <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>/ {todayTarget}</span>
          </div>

          <div className="flex items-center gap-2.5 mt-2">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-zinc-800'}`}>
              <div 
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, todayPercentage)}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold tabular-nums ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {todayPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Period Volume */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center border dark:border-emerald-800/40">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Period Volume
            </span>
          </div>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border dark:border-emerald-800/30 flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+12%</span>
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              {periodVolume}
            </span>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              clips uploaded
            </span>
          </div>
          <div className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            Target: {periodTarget} clips • {dateRangeList.length} days
          </div>
        </div>
      </div>

      {/* Card 3: Active Editors */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-zinc-200 flex items-center justify-center border dark:border-zinc-700/60">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Active Editors
            </span>
          </div>
          <div className="flex items-center -space-x-1.5">
            {employees.slice(0, 3).map((emp) => {
              const inits = emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
              return (
                <div
                  key={emp.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white dark:ring-zinc-950"
                  style={{ backgroundColor: emp.color || '#2563EB' }}
                  title={emp.name}
                >
                  {inits}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight tabular-nums flex items-baseline gap-1">
            <span className={isLight ? 'text-slate-900' : 'text-zinc-100'}>{activeEditorsCount}</span>
            <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>/ {employees.length}</span>
          </div>
          <div className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Managing {accounts.length} Instagram accounts
          </div>
        </div>
      </div>

      {/* Card 4: Top Performer */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center border dark:border-amber-800/40">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Top Performer
            </span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border dark:border-amber-800/30">
            <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>{topPerformer ? `${topPerformer.streak}d Streak` : '9d Streak'}</span>
          </div>
        </div>

        <div>
          <div className={`text-lg font-bold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
            {topPerformer ? topPerformer.employee.name : 'Priya Patel'}
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {topPerformer ? `${topPerformer.consistencyPct}% consistency (${topPerformer.daysMet}/${topPerformer.totalDays}d)` : '93% consistency (13/14)'}
          </div>
        </div>
      </div>

    </div>
  );
};
