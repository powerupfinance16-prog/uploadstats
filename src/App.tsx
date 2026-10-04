/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Employee, 
  Account, 
  Campaign, 
  DailyRecord, 
  DateRangeType,
  ThemeMode,
  TileStyle
} from './types';
import { 
  INITIAL_CAMPAIGNS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ACCOUNTS, 
  generateInitialRecords 
} from './data/mockData';
import { 
  getDateRangeList, 
  TODAY_STR 
} from './utils/dateUtils';
import { generateWhatsAppReport } from './utils/whatsappGenerator';
import { Header } from './components/Header';
import { KpiSummaryStrip } from './components/KpiSummaryStrip';
import { UploadMatrix } from './components/UploadMatrix';
import { DayInspectorModal } from './components/DayInspectorModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AccountManagementModal } from './components/AccountManagementModal';
import { EmployeeManagementModal } from './components/EmployeeManagementModal';
import { Check } from 'lucide-react';

const STORAGE_KEY_EMPLOYEES = 'focusflow_employees_v1';
const STORAGE_KEY_ACCOUNTS = 'focusflow_accounts_v1';
const STORAGE_KEY_CAMPAIGNS = 'focusflow_campaigns_v1';
const STORAGE_KEY_RECORDS = 'focusflow_records_v1';
const STORAGE_KEY_THEME = 'focusflow_theme_v1';
const STORAGE_KEY_TILE_STYLE = 'focusflow_tilestyle_v1';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      return saved ? JSON.parse(saved) : generateInitialRecords();
    } catch {
      return generateInitialRecords();
    }
  });

  // Theme & Tile Style
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [tileStyle, setTileStyle] = useState<TileStyle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TILE_STYLE);
      return (saved === 'solid' || saved === 'translucent' || saved === 'minimal') ? saved : 'solid';
    } catch {
      return 'solid';
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TILE_STYLE, tileStyle);
  }, [tileStyle]);

  // 2. Filter & Navigation State
  const [range, setRange] = useState<DateRangeType>('14'); // Default 14 Days
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPayouts, setShowPayouts] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // 3. Modals State
  const [inspectorState, setInspectorState] = useState<{
    isOpen: boolean;
    dateStr: string;
    employeeId?: string;
    accountId?: string;
  }>({
    isOpen: false,
    dateStr: TODAY_STR,
  });

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);

  // 4. Date Range List
  const dateRangeList = useMemo(() => {
    return getDateRangeList(range, TODAY_STR);
  }, [range]);

  // 5. Handlers
  const handleUpdateRecord = useCallback(
    (dateStr: string, accountId: string, newCount: number) => {
      const recordId = `${dateStr}_${accountId}`;
      setRecords((prev) => ({
        ...prev,
        [recordId]: {
          id: recordId,
          date: dateStr,
          accountId,
          uploadedClips: Math.max(0, newCount),
          updatedAt: Date.now(),
        },
      }));
    },
    []
  );

  const handleAssignAccount = useCallback(
    (accountId: string, employeeId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, employeeId } : acc))
      );
      const emp = employees.find((e) => e.id === employeeId);
      const acc = accounts.find((a) => a.id === accountId);
      if (emp && acc) {
        showToast(`Assigned ${acc.username} to ${emp.name}`);
      }
    },
    [employees, accounts]
  );

  const handleAddAccount = useCallback((newAcc: Omit<Account, 'id'>) => {
    const id = `acc_${Date.now()}`;
    const account: Account = { ...newAcc, id };
    setAccounts((prev) => [...prev, account]);
    showToast(`Added Instagram account ${account.username}`);
  }, []);

  const handleAddEmployee = useCallback((newEmp: Omit<Employee, 'id'>) => {
    const id = `emp_${Date.now()}`;
    const employee: Employee = { ...newEmp, id };
    setEmployees((prev) => [...prev, employee]);
    showToast(`Added team member ${employee.name}`);
  }, []);

  const handleResetData = useCallback(() => {
    if (window.confirm('Reset video upload matrix to initial sample data?')) {
      const initRec = generateInitialRecords();
      setEmployees(INITIAL_EMPLOYEES);
      setAccounts(INITIAL_ACCOUNTS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setRecords(initRec);
      localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
      localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
      localStorage.removeItem(STORAGE_KEY_CAMPAIGNS);
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      showToast('Reset to default sample data.');
    }
  }, []);

  // 1-Click WhatsApp Daily Report
  const handleCopyWhatsApp = useCallback(async () => {
    try {
      const report = generateWhatsAppReport(TODAY_STR, employees, accounts, records);
      await navigator.clipboard.writeText(report);
      setCopyFeedback(true);
      showToast("Today's WhatsApp Report copied to clipboard!");
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch (e) {
      console.error(e);
      setWhatsAppModalOpen(true);
    }
  }, [employees, accounts, records]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#090D16] text-slate-100'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title, Range Switcher, Campaign Filter, WhatsApp Button, Theme Toggle */}
      <Header
        range={range}
        onRangeChange={setRange}
        campaigns={campaigns}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
        onCopyWhatsApp={handleCopyWhatsApp}
        onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
        onOpenAddAccount={() => setAddAccountModalOpen(true)}
        onOpenAddEmployee={() => setAddEmployeeModalOpen(true)}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showPayouts={showPayouts}
        onTogglePayouts={() => setShowPayouts((prev) => !prev)}
        copyFeedback={copyFeedback}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 lg:p-8 max-w-[1720px] mx-auto w-full">
        
        {/* KPI Summary Strip */}
        <KpiSummaryStrip
          employees={employees}
          accounts={accounts}
          records={records}
          dateRangeList={dateRangeList}
          showPayouts={showPayouts}
          theme={theme}
        />

        {/* Datewise Habit Tracker Matrix Grid */}
        <UploadMatrix
          employees={employees}
          accounts={accounts}
          records={records}
          dateRangeList={dateRangeList}
          searchQuery={searchQuery}
          selectedCampaignId={selectedCampaignId}
          onOpenInspector={({ dateStr, employeeId, accountId }) => {
            setInspectorState({
              isOpen: true,
              dateStr,
              employeeId,
              accountId,
            });
          }}
          onAssignAccount={handleAssignAccount}
          onAddAccount={() => setAddAccountModalOpen(true)}
          theme={theme}
          tileStyle={tileStyle}
          onTileStyleChange={setTileStyle}
        />
      </main>

      {/* Day Inspector Detail Popover / Modal */}
      <DayInspectorModal
        isOpen={inspectorState.isOpen}
        onClose={() => setInspectorState((prev) => ({ ...prev, isOpen: false }))}
        dateStr={inspectorState.dateStr}
        employeeId={inspectorState.employeeId}
        accountId={inspectorState.accountId}
        employees={employees}
        accounts={accounts}
        records={records}
        onUpdateRecord={handleUpdateRecord}
        theme={theme}
      />

      {/* WhatsApp Report Generator Modal */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        employees={employees}
        accounts={accounts}
        records={records}
        dateRangeList={dateRangeList}
        theme={theme}
      />

      {/* Add Instagram Account Modal */}
      <AccountManagementModal
        isOpen={addAccountModalOpen}
        onClose={() => setAddAccountModalOpen(false)}
        onAddAccount={handleAddAccount}
        employees={employees}
        campaigns={campaigns}
      />

      {/* Add Employee Modal */}
      <EmployeeManagementModal
        isOpen={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
}
