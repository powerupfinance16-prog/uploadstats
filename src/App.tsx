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
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { KpiSummaryStrip } from './components/KpiSummaryStrip';
import { UploadMatrix } from './components/UploadMatrix';
import { DayInspectorModal } from './components/DayInspectorModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AccountManagementModal } from './components/AccountManagementModal';
import { EmployeeManagementModal } from './components/EmployeeManagementModal';
import { MemberShareModal } from './components/MemberShareModal';
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

  // Theme: default dark mode
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

  // 2. Navigation & Filter State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [range, setRange] = useState<DateRangeType>('4'); // Default Last 4 Days!
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
  const [memberShareState, setMemberShareState] = useState<{
    isOpen: boolean;
    employeeId?: string;
    dateStr?: string;
  }>({
    isOpen: false,
    dateStr: TODAY_STR,
  });

  // 4. Date Range List
  const dateRangeList = useMemo(() => {
    return getDateRangeList(range, TODAY_STR);
  }, [range]);

  // 5. Handlers
  const handleOpenMemberShare = useCallback((employeeId?: string, dateStr?: string) => {
    setMemberShareState({
      isOpen: true,
      employeeId: employeeId || employees[0]?.id,
      dateStr: dateStr || TODAY_STR,
    });
  }, [employees]);

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
    (accountId: string, newEmployeeId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, employeeId: newEmployeeId } : acc))
      );
      showToast('Assigned editor to account');
    },
    []
  );

  const handleAddAccount = useCallback((newAcc: Omit<Account, 'id'>) => {
    const id = `acc-${Date.now()}`;
    setAccounts((prev) => [...prev, { ...newAcc, id }]);
    showToast(`Added @${newAcc.username}`);
  }, []);

  const handleAddEmployee = useCallback((newEmp: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    setEmployees((prev) => [...prev, { ...newEmp, id }]);
    showToast(`Added team member ${newEmp.name}`);
  }, []);

  const handleResetData = useCallback(() => {
    if (window.confirm('Reset all data to sample records? Custom edits will be cleared.')) {
      setEmployees(INITIAL_EMPLOYEES);
      setAccounts(INITIAL_ACCOUNTS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setRecords(generateInitialRecords());
      localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
      localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
      localStorage.removeItem(STORAGE_KEY_CAMPAIGNS);
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      showToast('Data reset to default sample values');
    }
  }, []);

  const handleCopyWhatsApp = useCallback(async () => {
    const report = generateWhatsAppReport(
      TODAY_STR,
      employees,
      accounts,
      records
    );

    try {
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
    <div className={`h-screen w-screen overflow-hidden flex font-sans transition-colors duration-200 select-none ${
      isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#09090B] text-zinc-100'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 stroke-[2.5] text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onOpenMemberShare={() => handleOpenMemberShare()}
        onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
      />

      {/* Main Content Viewport - strictly fits 1 screen */}
      <main className="flex-1 h-screen flex flex-col min-w-0 p-3.5 lg:p-4 overflow-hidden gap-2.5">
        
        {/* Dashboard Header with Title, Range Tabs, More actions ⋮ */}
        <DashboardHeader
          range={range}
          onRangeChange={setRange}
          dateRangeList={dateRangeList}
          theme={theme}
          onOpenMemberShare={() => handleOpenMemberShare()}
          onCopyWhatsApp={handleCopyWhatsApp}
          onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
          onOpenAddAccount={() => setAddAccountModalOpen(true)}
          onOpenAddEmployee={() => setAddEmployeeModalOpen(true)}
          onResetData={handleResetData}
          copyFeedback={copyFeedback}
        />

        {/* 4 KPI Summary Cards */}
        <KpiSummaryStrip
          employees={employees}
          accounts={accounts}
          records={records}
          dateRangeList={dateRangeList}
          theme={theme}
        />

        {/* The Central Upload Matrix Grid Table */}
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
          onShareMember={(employeeId, dateStr) => handleOpenMemberShare(employeeId, dateStr)}
        />

      </main>

      {/* Day Inspector Popover / Modal (Adjust Clips) */}
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
        onShareMember={(employeeId, dateStr) => handleOpenMemberShare(employeeId, dateStr)}
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

      {/* Creator Daily Brief Graphic & Share Modal (The popup from the user's uploaded reference) */}
      <MemberShareModal
        isOpen={memberShareState.isOpen}
        onClose={() => setMemberShareState((prev) => ({ ...prev, isOpen: false }))}
        employees={employees}
        accounts={accounts}
        records={records}
        dateRangeList={dateRangeList}
        initialEmployeeId={memberShareState.employeeId}
        initialDateStr={memberShareState.dateStr}
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
