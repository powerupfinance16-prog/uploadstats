import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Instagram, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Lock, 
  Check, 
  AlertCircle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Employee, Account, Campaign, ThemeMode } from '../types';

interface AdminPanelProps {
  employees: Employee[];
  accounts: Account[];
  campaigns: Campaign[];
  onUpdateEmployee: (updated: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddEmployee: (newEmp: Omit<Employee, 'id'>) => void;
  onUpdateAccount: (updated: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddAccount: (newAcc: Omit<Account, 'id'>) => void;
  onLockAdmin: () => void;
  onBackToDashboard: () => void;
  theme: ThemeMode;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  employees,
  accounts,
  campaigns,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddEmployee,
  onUpdateAccount,
  onDeleteAccount,
  onAddAccount,
  onLockAdmin,
  onBackToDashboard,
  theme,
}) => {
  const isLight = theme === 'light';
  const [subTab, setSubTab] = useState<'members' | 'accounts'>('members');

  // Edit Employee State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: 'Reels Editor',
    ratePerVideo: 50,
    dailySalary: 300,
    monthlySalary: 25000,
    color: '#10B981',
  });

  // Edit Account State
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({
    username: '@',
    targetDailyClips: 3,
    employeeId: employees[0]?.id || '',
    campaignId: campaigns[0]?.id || '',
    niche: 'Content & Tech',
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveEmployee = () => {
    if (!editingEmployee) return;
    if (!editingEmployee.name.trim()) {
      alert('Member name is required');
      return;
    }
    onUpdateEmployee(editingEmployee);
    setEditingEmployee(null);
    showToast(`Updated member: ${editingEmployee.name}`);
  };

  const handleCreateEmployee = () => {
    if (!newEmployee.name.trim()) {
      alert('Member name is required');
      return;
    }
    onAddEmployee(newEmployee);
    setIsAddingEmployee(false);
    setNewEmployee({
      name: '',
      role: 'Reels Editor',
      ratePerVideo: 50,
      dailySalary: 300,
      monthlySalary: 25000,
      color: '#3B82F6',
    });
    showToast('New team member added');
  };

  const handleSaveAccount = () => {
    if (!editingAccount) return;
    let username = editingAccount.username.trim();
    if (!username.startsWith('@')) username = `@${username}`;
    onUpdateAccount({ ...editingAccount, username });
    setEditingAccount(null);
    showToast(`Updated account: ${username}`);
  };

  const handleCreateAccount = () => {
    let username = newAccount.username.trim();
    if (!username || username === '@') {
      alert('Instagram username is required');
      return;
    }
    if (!username.startsWith('@')) username = `@${username}`;
    onAddAccount({ ...newAccount, username });
    setIsAddingAccount(false);
    setNewAccount({
      username: '@',
      targetDailyClips: 3,
      employeeId: employees[0]?.id || '',
      campaignId: campaigns[0]?.id || '',
      niche: 'Content & Tech',
    });
    showToast('New Instagram account created');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      
      {/* Toast Alert */}
      {feedback && (
        <div className="fixed top-5 right-6 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#121214] border-zinc-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-100">
                Admin Control Panel
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                UNLOCKED (WIN2026)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage team members, Instagram handles, daily targets, and pay structures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-zinc-300 hover:text-white border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all"
          >
            ← Back to Matrix
          </button>
          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className={`px-4 py-2 border-b flex items-center justify-between shrink-0 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#18181B] border-zinc-800'
      }`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('members')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'members'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Creators ({employees.length})</span>
          </button>

          <button
            onClick={() => setSubTab('accounts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'accounts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram Accounts ({accounts.length})</span>
          </button>
        </div>

        {subTab === 'members' ? (
          <button
            onClick={() => setIsAddingEmployee(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Creator</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddingAccount(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Account</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ===================== TAB 1: MEMBERS ===================== */}
        {subTab === 'members' && (
          <div className="space-y-3">
            
            {/* Add Employee Inline Form */}
            {isAddingEmployee && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#18181B] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400">Add New Team Creator</span>
                  <button onClick={() => setIsAddingEmployee(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Role / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Reels Editor"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Avatar Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newEmployee.color || '#10B981'}
                        onChange={(e) => setNewEmployee({ ...newEmployee, color: e.target.value })}
                        className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs text-zinc-400 font-mono">{newEmployee.color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Rate Per Video (₹)</label>
                    <input
                      type="number"
                      value={newEmployee.ratePerVideo || 50}
                      onChange={(e) => setNewEmployee({ ...newEmployee, ratePerVideo: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Daily Salary Base (₹)</label>
                    <input
                      type="number"
                      value={newEmployee.dailySalary || 300}
                      onChange={(e) => setNewEmployee({ ...newEmployee, dailySalary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      value={newEmployee.monthlySalary || 25000}
                      onChange={(e) => setNewEmployee({ ...newEmployee, monthlySalary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingEmployee(false)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEmployee}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Save Creator
                  </button>
                </div>
              </div>
            )}

            {/* List of Team Members */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#18181B] text-zinc-400 font-semibold">
                    <th className="px-4 py-3">Creator Name & Role</th>
                    <th className="px-4 py-3">Managed Accounts</th>
                    <th className="px-4 py-3">Total Daily Quota</th>
                    <th className="px-4 py-3">Pay Rates</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {employees.map((emp) => {
                    const empAccounts = accounts.filter((a) => a.employeeId === emp.id);
                    const totalDailyTarget = empAccounts.reduce((sum, a) => sum + a.targetDailyClips, 0);
                    const isEditing = editingEmployee?.id === emp.id;

                    if (isEditing && editingEmployee) {
                      return (
                        <tr key={emp.id} className="bg-zinc-900/90">
                          <td className="px-4 py-3" colSpan={5}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-blue-400">Editing Creator: {emp.name}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingEmployee(null)}
                                    className="px-2.5 py-1 rounded-md border border-zinc-700 text-xs text-zinc-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveEmployee}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Changes</span>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Full Name</label>
                                  <input
                                    type="text"
                                    value={editingEmployee.name}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Role</label>
                                  <input
                                    type="text"
                                    value={editingEmployee.role}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Rate / Clip (₹)</label>
                                  <input
                                    type="number"
                                    value={editingEmployee.ratePerVideo || 50}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, ratePerVideo: Number(e.target.value) })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Monthly Salary (₹)</label>
                                  <input
                                    type="number"
                                    value={editingEmployee.monthlySalary || 25000}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, monthlySalary: Number(e.target.value) })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={emp.id} className="hover:bg-[#18181B] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                              style={{ backgroundColor: emp.color || '#10B981' }}
                            >
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-100">{emp.name}</div>
                              <div className="text-[11px] text-zinc-500">{emp.role}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-zinc-300">
                          <div className="flex flex-wrap gap-1">
                            {empAccounts.length > 0 ? (
                              empAccounts.map((acc) => (
                                <span key={acc.id} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
                                  {acc.username}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-zinc-500 italic">No accounts assigned</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-emerald-400">{totalDailyTarget} clips/day</span>
                        </td>

                        <td className="px-4 py-3 text-zinc-400 text-[11px]">
                          <div>Rate: ₹{emp.ratePerVideo || 50}/clip</div>
                          <div>Salary: ₹{emp.monthlySalary || 25000}/mo</div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingEmployee(emp)}
                              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${emp.name}? Accounts assigned to them will be unassigned.`)) {
                                  onDeleteEmployee(emp.id);
                                  showToast(`Removed member ${emp.name}`);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ===================== TAB 2: INSTAGRAM ACCOUNTS ===================== */}
        {subTab === 'accounts' && (
          <div className="space-y-3">
            
            {/* Add Account Inline Form */}
            {isAddingAccount && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#18181B] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400">Add New Instagram Account</span>
                  <button onClick={() => setIsAddingAccount(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Handle / Username</label>
                    <input
                      type="text"
                      placeholder="e.g. @tech_reels"
                      value={newAccount.username}
                      onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Target Daily Clips</label>
                    <input
                      type="number"
                      value={newAccount.targetDailyClips}
                      onChange={(e) => setNewAccount({ ...newAccount, targetDailyClips: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Assigned Creator</label>
                    <select
                      value={newAccount.employeeId}
                      onChange={(e) => setNewAccount({ ...newAccount, employeeId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Niche / Category</label>
                    <input
                      type="text"
                      placeholder="e.g. AI News & Tech"
                      value={newAccount.niche || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, niche: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingAccount(false)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Save Account
                  </button>
                </div>
              </div>
            )}

            {/* List of Instagram Accounts */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#18181B] text-zinc-400 font-semibold">
                    <th className="px-4 py-3">Instagram Handle</th>
                    <th className="px-4 py-3">Target Clips / Day</th>
                    <th className="px-4 py-3">Assigned Creator</th>
                    <th className="px-4 py-3">Niche</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {accounts.map((acc) => {
                    const assignedEmp = employees.find((e) => e.id === acc.employeeId);
                    const isEditing = editingAccount?.id === acc.id;

                    if (isEditing && editingAccount) {
                      return (
                        <tr key={acc.id} className="bg-zinc-900/90">
                          <td className="px-4 py-3" colSpan={5}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-blue-400">Editing Account: {acc.username}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingAccount(null)}
                                    className="px-2.5 py-1 rounded-md border border-zinc-700 text-xs text-zinc-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveAccount}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Changes</span>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Handle / Username</label>
                                  <input
                                    type="text"
                                    value={editingAccount.username}
                                    onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Target Clips / Day</label>
                                  <input
                                    type="number"
                                    value={editingAccount.targetDailyClips}
                                    onChange={(e) => setEditingAccount({ ...editingAccount, targetDailyClips: Math.max(1, Number(e.target.value)) })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Reassign Creator</label>
                                  <select
                                    value={editingAccount.employeeId}
                                    onChange={(e) => setEditingAccount({ ...editingAccount, employeeId: e.target.value })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  >
                                    <option value="">Unassigned</option>
                                    {employees.map((e) => (
                                      <option key={e.id} value={e.id}>
                                        {e.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-400 block mb-1">Niche</label>
                                  <input
                                    type="text"
                                    value={editingAccount.niche || ''}
                                    onChange={(e) => setEditingAccount({ ...editingAccount, niche: e.target.value })}
                                    className="w-full px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={acc.id} className="hover:bg-[#18181B] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-pink-950/40 border border-pink-500/25 text-pink-400 flex items-center justify-center shrink-0">
                              <Instagram className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-zinc-100">{acc.username}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-emerald-400">{acc.targetDailyClips} clips/day</span>
                        </td>

                        <td className="px-4 py-3">
                          {assignedEmp ? (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                                style={{ backgroundColor: assignedEmp.color || '#2563EB' }}
                              >
                                {assignedEmp.name[0]}
                              </div>
                              <span className="text-zinc-200">{assignedEmp.name}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-zinc-400">
                          {acc.niche || 'General'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingAccount(acc)}
                              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Edit Account"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete Instagram account ${acc.username}?`)) {
                                  onDeleteAccount(acc.id);
                                  showToast(`Deleted ${acc.username}`);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
