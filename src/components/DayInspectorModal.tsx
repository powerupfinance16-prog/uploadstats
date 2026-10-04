import React from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  RotateCcw, 
  Calendar, 
  Instagram, 
  User, 
  CheckCircle2,
  Clock,
  Share2
} from 'lucide-react';
import { Employee, Account, DailyRecord } from '../types';
import { formatDateFull, isToday } from '../utils/dateUtils';

interface DayInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  employeeId?: string;
  accountId?: string;
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  onUpdateRecord: (dateStr: string, accountId: string, newCount: number) => void;
  theme?: 'dark' | 'light';
  onShareMember?: (employeeId: string, dateStr: string) => void;
}

export const DayInspectorModal: React.FC<DayInspectorModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  employeeId,
  accountId,
  employees,
  accounts,
  records,
  onUpdateRecord,
  theme = 'dark',
  onShareMember,
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const currentEmployee = employees.find((e) => e.id === employeeId);
  const singleAccount = accountId ? accounts.find((a) => a.id === accountId) : undefined;

  // Find relevant accounts for this inspector view
  let relevantAccounts: Account[] = [];
  if (singleAccount) {
    relevantAccounts = [singleAccount];
  } else if (currentEmployee) {
    relevantAccounts = accounts.filter((a) => a.employeeId === currentEmployee.id);
  } else {
    relevantAccounts = accounts;
  }

  const formattedDate = formatDateFull(dateStr);
  const todayHighlight = isToday(dateStr);

  // Compute total uploaded and target for this set
  let totalUploaded = 0;
  let totalTarget = 0;

  relevantAccounts.forEach((acc) => {
    const rec = records[`${dateStr}_${acc.id}`];
    totalUploaded += rec ? rec.uploadedClips : 0;
    totalTarget += acc.targetDailyClips;
  });

  const isMet = totalTarget > 0 && totalUploaded >= totalTarget;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isLight ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-sky-500/10 border-sky-500/25 text-sky-400'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Day Upload Inspector</h3>
                {todayHighlight && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-sky-500 text-slate-950">
                    Today
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{formattedDate}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator / Scope Banner */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/30 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2">
            {currentEmployee ? (
              <>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: currentEmployee.color || '#10B981' }}
                >
                  {currentEmployee.name.charAt(0)}
                </div>
                <div>
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {currentEmployee.name}
                  </span>
                  <span className={`text-[11px] ml-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ({relevantAccounts.length} {relevantAccounts.length === 1 ? 'account' : 'accounts'})
                  </span>
                </div>
              </>
            ) : singleAccount ? (
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>{singleAccount.username}</span>
              </div>
            ) : (
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Team Accounts</span>
            )}
          </div>

          {/* Actions & Aggregate Quota Badge */}
          <div className="flex items-center gap-2">
            {currentEmployee && onShareMember && (
              <button
                onClick={() => {
                  onClose();
                  onShareMember(currentEmployee.id, dateStr);
                }}
                title="Generate and share member stats graphic card"
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
                  isLight 
                    ? 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100' 
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            )}

            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
              isMet
                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : totalUploaded > 0
                  ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalUploaded} / {totalTarget} clips {isMet ? '✓' : ''}
            </span>
          </div>
        </div>

        {/* Account List with Quick +/- Adjusters */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {relevantAccounts.map((acc) => {
            const rec = records[`${dateStr}_${acc.id}`];
            const uploaded = rec ? rec.uploadedClips : 0;
            const target = acc.targetDailyClips;
            const accountMet = uploaded >= target;
            const accountPartial = uploaded > 0 && uploaded < target;

            const handleIncrement = () => {
              onUpdateRecord(dateStr, acc.id, uploaded + 1);
            };

            const handleDecrement = () => {
              onUpdateRecord(dateStr, acc.id, Math.max(0, uploaded - 1));
            };

            const handleSetTarget = () => {
              onUpdateRecord(dateStr, acc.id, target);
            };

            const handleClear = () => {
              onUpdateRecord(dateStr, acc.id, 0);
            };

            return (
              <div
                key={acc.id}
                className={`rounded-xl p-4 flex flex-col gap-3 transition-all border ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span>{acc.username}</span>
                        {accountMet && (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        )}
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Target: <span className={`font-semibold tabular-nums ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{target}</span> clips/day
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    accountMet
                      ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/15 text-emerald-400'
                      : accountPartial
                        ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/15 text-amber-400'
                        : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {accountMet ? 'Quota Met' : accountPartial ? 'In Progress' : 'Pending'}
                  </span>
                </div>

                {/* Adjuster Strip */}
                <div className={`flex items-center justify-between pt-2 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {/* Decrement Button */}
                    <button
                      onClick={handleDecrement}
                      disabled={uploaded <= 0}
                      className={`w-8 h-8 rounded-lg disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors font-bold text-base ${
                        isLight 
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Decrease by 1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Numeric Count Display */}
                    <div className={`w-12 h-8 rounded-lg border flex items-center justify-center text-sm font-bold tabular-nums ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900' 
                        : 'bg-slate-900 border-slate-700/80 text-white'
                    }`}>
                      {uploaded}
                    </div>

                    {/* Increment Button */}
                    <button
                      onClick={handleIncrement}
                      className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors font-bold text-base shadow-xs shadow-sky-600/30"
                      title="Increase by 1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSetTarget}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 border ${
                        isLight
                          ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-300'
                          : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-sky-500/30'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Set Target ({target})</span>
                    </button>

                    <button
                      onClick={handleClear}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        isLight
                          ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                      title="Reset to 0"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Changes save instantly to live matrix
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              isLight 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
