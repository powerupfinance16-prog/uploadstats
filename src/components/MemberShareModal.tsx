import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Calendar, 
  User, 
  ExternalLink,
  ChevronRight,
  Flame,
  Instagram
} from 'lucide-react';
import { Employee, Account, DailyRecord, ThemeMode } from '../types';
import { 
  computeMemberDailyStats, 
  generateMemberWhatsAppText, 
  drawMemberStatsCard 
} from '../utils/memberShareGenerator';
import { TODAY_STR, formatDateFull, formatDateShort } from '../utils/dateUtils';
import { getWhatsAppWebUrl } from '../utils/whatsappGenerator';

interface MemberShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  dateRangeList: string[];
  initialEmployeeId?: string;
  initialDateStr?: string;
  theme: ThemeMode;
}

export const MemberShareModal: React.FC<MemberShareModalProps> = ({
  isOpen,
  onClose,
  employees,
  accounts,
  records,
  dateRangeList,
  initialEmployeeId,
  initialDateStr,
  theme,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployeeId || employees[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDateStr || TODAY_STR
  );
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialEmployeeId) setSelectedEmpId(initialEmployeeId);
    if (initialDateStr) setSelectedDate(initialDateStr);
  }, [initialEmployeeId, initialDateStr, isOpen]);

  const activeEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const stats = React.useMemo(() => {
    if (!activeEmployee) return null;
    return computeMemberDailyStats(activeEmployee, selectedDate, accounts, records, dateRangeList);
  }, [activeEmployee, selectedDate, accounts, records, dateRangeList]);

  // Redraw canvas whenever stats change
  useEffect(() => {
    if (!stats || !canvasRef.current) return;
    drawMemberStatsCard(canvasRef.current, stats);
  }, [stats]);

  if (!isOpen || !stats || !activeEmployee) return null;

  const isLight = theme === 'light';
  const whatsappText = generateMemberWhatsAppText(stats);
  const whatsappUrl = getWhatsAppWebUrl(whatsappText);

  // Download high-resolution PNG
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const cleanName = activeEmployee.name.toLowerCase().replace(/\s+/g, '_');
    a.download = `${cleanName}_daily_brief_${selectedDate}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy PNG image to clipboard
  const handleCopyImageToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch {
          handleDownloadImage();
        }
      }, 'image/png');
    } catch {
      handleDownloadImage();
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const remaining = Math.max(0, stats.totalTarget - stats.totalUploaded);
  const initials = activeEmployee.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const pctRatio = Math.min(1, stats.totalTarget > 0 ? stats.totalUploaded / stats.totalTarget : 0);

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pctRatio * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-xl my-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/90 bg-white text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Hidden Canvas for High-Resolution 1080x1080 PNG Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Top Control Bar: Pick Employee, Pick Date & Close */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer shadow-2xs"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer shadow-2xs"
              >
                {dateRangeList.map((d) => (
                  <option key={d} value={d}>
                    {formatDateShort(d)} {d === TODAY_STR ? '(Today)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THE EXACT AESTHETIC APPLE CARD (MATCHING USER SCREENSHOT) */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          
          {/* Header Row: Squircle F, FOCUSFLOW, Status Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-sky-500/20 tracking-tight">
                F
              </div>
              <div>
                <div className="text-xl font-black tracking-tight leading-none">
                  <span className="text-slate-900">FOCUS</span>
                  <span className="text-blue-600">FLOW</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em] mt-1">
                  CREATOR DAILY BRIEF
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold tracking-wide ${
              stats.isMet
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${stats.isMet ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}`} />
              <span>{stats.isMet ? 'QUOTA MET' : 'IN PROGRESS'}</span>
            </div>
          </div>

          {/* Creator Profile Row */}
          <div className="flex items-center gap-4 pt-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {activeEmployee.name}
              </h2>
              <div className="text-sm font-medium text-slate-500">
                {activeEmployee.role || 'Short-Form Specialist'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateFull(selectedDate)}</span>
              </div>
            </div>
          </div>

          {/* Section 1: TODAY'S PROGRESS Card Container */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Circular Ring Gauge */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
                {/* Track */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="11"
                />
                {/* Progress Arc */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  fill="transparent"
                  stroke="url(#blueGradient)"
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                  {stats.totalUploaded}/{stats.totalTarget}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Uploads
                </div>
              </div>
            </div>

            {/* Right Side Stats */}
            <div className="flex-1 w-full space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                TODAY'S PROGRESS
              </div>

              {/* Big Typography 2 / 4 */}
              <div className="text-4xl font-extrabold tracking-tight tabular-nums flex items-baseline gap-1">
                <span className="text-blue-600">{stats.totalUploaded}</span>
                <span className="text-slate-900">/ {stats.totalTarget}</span>
              </div>

              {/* Horizontal Bar with % on Right */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-3 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.quotaPct)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {stats.quotaPct}%
                </span>
              </div>

              {/* Motivational Text */}
              <p className="text-xs text-slate-500 font-medium pt-1">
                {remaining === 0
                  ? 'Target met! Outstanding consistency today. 🔥'
                  : `Keep going! ${remaining} more to complete today.`}
              </p>
            </div>
          </div>

          {/* Section 2: ACCOUNT BREAKDOWN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="tracking-wider uppercase text-[11px]">ACCOUNT BREAKDOWN</span>
              <span className="font-medium text-slate-500">
                {stats.accounts.length} Assigned {stats.accounts.length === 1 ? 'Channel' : 'Channels'}
              </span>
            </div>

            <div className="space-y-2">
              {stats.accounts.map((acc) => (
                <div
                  key={acc.account.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Instagram className="w-5 h-5 text-slate-200" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {acc.account.username}
                      </div>
                      <div className="text-xs text-slate-500">
                        {acc.account.niche || 'Workouts & Nutrition'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold tabular-nums">
                      <span className="text-blue-600">{acc.uploaded}</span>
                      <span className="text-slate-900"> / {acc.target}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 7-Day Consistency Strip (Sun through Sat) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {stats.recentHabitDays.map((h) => {
              const isSelected = h.isSelected;

              return (
                <button
                  key={h.dateStr}
                  onClick={() => setSelectedDate(h.dateStr)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-2 border-blue-500 shadow-sm'
                      : 'bg-slate-50/60 border border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                    {h.dayName}
                  </span>

                  {/* Circular Status Icon */}
                  <div className="my-2">
                    {h.met ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                        ✓
                      </div>
                    ) : h.partial ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center animate-spin">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>

                  <span className={`text-[11px] font-bold tabular-nums ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>
                    {h.uploaded} / {h.target}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Summary Footer Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{stats.streak} Days Active Streak</span>
            </div>
            <div className="font-semibold text-slate-700">
              Estimated Day Payout: <span className="font-bold text-sky-600">₹{stats.dailyEarnings}</span>
            </div>
          </div>

        </div>

        {/* Modal Action Controls Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Direct on WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Text Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyImageToClipboard}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                copiedImage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Image Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG Card</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
