import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Calendar,
  Share2
} from 'lucide-react';
import { Employee, Account, DailyRecord } from '../types';
import { generateWhatsAppReport, getWhatsAppWebUrl } from '../utils/whatsappGenerator';
import { TODAY_STR, formatDateShort } from '../utils/dateUtils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  accounts: Account[];
  records: Record<string, DailyRecord>;
  dateRangeList: string[];
  theme?: 'dark' | 'light';
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  employees,
  accounts,
  records,
  dateRangeList,
  theme = 'dark',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;
  const isLight = theme === 'light';

  const reportText = generateWhatsAppReport(selectedDate, employees, accounts, records);
  const whatsappUrl = getWhatsAppWebUrl(reportText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

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
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isLight ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-sky-500/10 border-sky-500/25 text-sky-400'
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Daily WhatsApp Report Generator
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Formatted text ready for WhatsApp/Slack team broadcast
              </p>
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

        {/* Date Selector Strip */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800'
        }`}>
          <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Generate for Date:</span>
          </div>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer ${
              isLight 
                ? 'bg-white border border-slate-300 text-slate-800' 
                : 'bg-slate-900 border border-slate-700 text-slate-200'
            }`}
          >
            {dateRangeList.map((d) => (
              <option key={d} value={d}>
                {formatDateShort(d)} {d === TODAY_STR ? '(Today)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp Preview Box */}
        <div className="p-6">
          <div className="relative">
            <pre className={`p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-sky-500/20 border ${
              isLight 
                ? 'bg-slate-900 border-slate-800 text-sky-300' 
                : 'bg-slate-950 border-slate-800/90 text-sky-300'
            }`}>
              {reportText}
            </pre>

            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-all flex items-center gap-1.5 shadow-sm shadow-sky-600/30"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <p className={`text-[11px] mt-2.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Tip: Includes emoji markers (✅ Met, ⏳ Partial, ❌ Missed) and breakdown of every Instagram account.
          </p>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open WhatsApp Web</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isLight 
                  ? 'text-slate-700 bg-slate-200 hover:bg-slate-300' 
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
