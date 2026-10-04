import React from 'react';
import { 
  LayoutDashboard, 
  Grid, 
  Users, 
  BarChart2, 
  FileText, 
  Settings, 
  Sun, 
  Moon, 
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenMemberShare: () => void;
  onOpenWhatsAppModal: () => void;
  isAdminUnlocked: boolean;
  onPromptAdminPassword: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onOpenMemberShare,
  onOpenWhatsAppModal,
  isAdminUnlocked,
  onPromptAdminPassword,
}) => {
  const isLight = theme === 'light';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'matrix', label: 'Upload Matrix', icon: Grid },
    { id: 'creators', label: 'Creators', icon: Users, action: onOpenMemberShare },
    { 
      id: 'admin', 
      label: 'Admin Panel', 
      icon: ShieldCheck, 
      badge: isAdminUnlocked ? 'Unlocked' : 'WIN2026',
      badgeColor: isAdminUnlocked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400',
      action: () => {
        if (isAdminUnlocked) {
          onTabChange('admin');
        } else {
          onPromptAdminPassword();
        }
      } 
    },
    { id: 'reports', label: 'Reports', icon: FileText, action: onOpenWhatsAppModal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`w-56 shrink-0 h-screen flex flex-col justify-between p-4 border-r transition-colors z-20 ${
      isLight 
        ? 'bg-white border-slate-200/80 text-slate-800' 
        : 'bg-[#09090B] border-zinc-800 text-zinc-200'
    }`}>
      
      {/* Top Brand Logo */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5 px-2 py-0.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm tracking-tight">
            F
          </div>
          <span className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
            FocusFlow
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-blue-50/90 text-blue-600 shadow-2xs'
                      : 'bg-zinc-800 text-zinc-100 shadow-xs'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? (isLight ? 'text-blue-600' : 'text-zinc-100') 
                      : item.id === 'admin'
                        ? 'text-amber-400'
                        : 'text-zinc-500'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${item.badgeColor || 'bg-zinc-800 text-zinc-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mode Toggle Button */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800">
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            isLight
              ? 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-[#121214] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {isLight ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-300" />
            )}
            <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>

    </aside>
  );
};
