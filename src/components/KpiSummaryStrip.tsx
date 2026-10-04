import React from 'react';
import { 
  Flame, 
  Users, 
  Video, 
  Award,
  DollarSign
} from 'lucide-react';
import { Employee, Account, DailyRecord, ThemeMode } from '../types';
import { TODAY_STR } from '../utils/dateUtils';

interface KpiSummaryStripProps {
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  dateRangeList: string[];
  showPayouts: boolean;
  theme: ThemeMode;
}

interface PerformerStats {
  employee: Employee;
  consistencyPct: number;
  daysMet: number;
  totalDays: number;
  streak: number;
}

export const KpiSummaryStrip: React.FC<KpiSummaryStripProps> = ({
  employees,
  accounts,
  records,
  dateRangeList,
  showPayouts,
  theme,
}) => {
  const isLight = theme === 'light';

  // 1. Today's Uploads vs Quota
  let todayUploaded = 0;
  let todayTarget = 0;

  accounts.forEach((acc) => {
    todayTarget += acc.targetDailyClips;
    const rec = records[`${TODAY_STR}_${acc.id}`];
    if (rec) {
      todayUploaded += rec.uploadedClips;
    }
  });

  const todayPercentage = todayTarget > 0 ? Math.min(100, Math.round((todayUploaded / todayTarget) * 100)) : 0;
  const isTodayComplete = todayUploaded >= todayTarget && todayTarget > 0;

  // 2. Period Volume (Total clips across active accounts in selected dates)
  let periodVolume = 0;
  let periodTarget = 0;
  let periodPayout = 0;

  dateRangeList.forEach((dateStr) => {
    accounts.forEach((acc) => {
      periodTarget += acc.targetDailyClips;
      const rec = records[`${dateStr}_${acc.id}`];
      if (rec) {
        const count = rec.uploadedClips;
        periodVolume += count;
        if (acc.employeeId) {
          const emp = employees.find((e) => e.id === acc.employeeId);
          if (emp && emp.ratePerVideo) {
            periodPayout += count * emp.ratePerVideo;
          }
        }
      }
    });
  });

  // 3. Active Editors (count of editors assigned to >= 1 account)
  const activeEditorIds = new Set(
    accounts.map((a) => a.employeeId).filter((id): id is string => Boolean(id))
  );
  const activeEditorsCount = activeEditorIds.size;

  // 4. Top Consistency / Performer
  const topPerformer = React.useMemo<PerformerStats | null>(() => {
    let best: PerformerStats | null = null;

    employees.forEach((emp) => {
      const empAccounts = accounts.filter((a) => a.employeeId === emp.id);
      if (empAccounts.length === 0) return;

      const dailyTarget = empAccounts.reduce((sum, a) => sum + a.targetDailyClips, 0);
      if (dailyTarget === 0) return;

      let daysMet = 0;
      let currentStreak = 0;
      let streakBroken = false;

      // Check days in reverse starting from today
      for (let i = dateRangeList.length - 1; i >= 0; i--) {
        const dateStr = dateRangeList[i];
        let dayUploaded = 0;
        empAccounts.forEach((acc) => {
          const rec = records[`${dateStr}_${acc.id}`];
          if (rec) dayUploaded += rec.uploadedClips;
        });

        if (dayUploaded >= dailyTarget) {
          daysMet++;
          if (!streakBroken) {
            currentStreak++;
          }
        } else {
          streakBroken = true;
        }
      }

      const consistencyPct = Math.round((daysMet / Math.max(1, dateRangeList.length)) * 100);

      if (!best || consistencyPct > best.consistencyPct) {
        best = {
          employee: emp,
          consistencyPct,
          daysMet,
          totalDays: dateRangeList.length,
          streak: currentStreak,
        };
      }
    });

    return best;
  }, [employees, accounts, records, dateRangeList]);

  const cardClasses = `rounded-2xl p-4 flex flex-col justify-between transition-all border ${
    isLight 
      ? 'bg-white border-slate-200 shadow-sm hover:shadow hover:border-slate-300' 
      : 'bg-slate-900 border-slate-800 hover:border-slate-700/80 shadow-md'
  }`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. Today's Uploads Progress */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Today's Uploads
          </span>
          <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded ${
            isTodayComplete 
              ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
              : isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {todayUploaded} / {todayTarget} clips
          </span>
        </div>

        <div className="space-y-2 mt-1">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tracking-tight tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {todayUploaded}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                of {todayTarget} quota
              </span>
            </div>
            <span className={`text-sm font-bold tabular-nums ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {todayPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTodayComplete 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, todayPercentage)}%` }}
            />
          </div>
        </div>

        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'
        }`}>
          <span>Target: {todayTarget} daily</span>
          <span className="font-semibold">{todayTarget - todayUploaded > 0 ? `${todayTarget - todayUploaded} remaining` : '✓ Target Met'}</span>
        </div>
      </div>

      {/* 2. Period Volume */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {showPayouts ? 'Period Volume & Payout' : 'Period Volume'}
          </span>
          <Video className="w-4 h-4 text-emerald-500" />
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {periodVolume}
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              clips uploaded
            </span>
          </div>

          {showPayouts ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-500 tabular-nums">
              <span>₹{periodPayout.toLocaleString()}</span>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                editor payout
              </span>
            </div>
          ) : (
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Target across {dateRangeList.length} days: <span className="font-semibold tabular-nums">{periodTarget}</span> clips
            </p>
          )}
        </div>

        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'
        }`}>
          <span>Range: {dateRangeList.length} days</span>
          <span className="font-semibold tabular-nums">
            ~{(periodVolume / Math.max(1, dateRangeList.length)).toFixed(1)} clips/day
          </span>
        </div>
      </div>

      {/* 3. Active Editors */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Active Editors
          </span>
          <Users className="w-4 h-4 text-blue-500" />
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {activeEditorsCount}
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              of {employees.length} team members
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Managing <span className="font-bold tabular-nums">{accounts.length}</span> Instagram accounts
          </p>
        </div>

        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'
        }`}>
          <span>Assigned: {accounts.filter(a => a.employeeId).length}</span>
          <span className="text-amber-500 font-bold">
            {accounts.filter(a => !a.employeeId).length} Unassigned
          </span>
        </div>
      </div>

      {/* 4. Top Consistency / Performer */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Top Performer
          </span>
          <Award className="w-4 h-4 text-yellow-500" />
        </div>

        {topPerformer ? (
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                style={{ backgroundColor: topPerformer.employee.color || '#10B981' }}
              >
                {topPerformer.employee.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {topPerformer.employee.name}
                </div>
                <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {topPerformer.consistencyPct}% consistency ({topPerformer.daysMet}/{topPerformer.totalDays}d)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">No active performer data</div>
        )}

        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'
        }`}>
          <span>Current Streak</span>
          {topPerformer ? (
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums">{topPerformer.streak} Days</span>
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>

    </div>
  );
};
