import React, { useState } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#E11D48', // Rose
];

export const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Reel Editor');
  const [ratePerVideo, setRatePerVideo] = useState(50);
  const [dailySalary, setDailySalary] = useState(300);
  const [monthlySalary, setMonthlySalary] = useState(25000);
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddEmployee({
      name: name.trim(),
      role: role.trim() || undefined,
      ratePerVideo: Number(ratePerVideo) || 0,
      dailySalary: Number(dailySalary) || 0,
      monthlySalary: Number(monthlySalary) || 0,
      color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Add Team Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Das"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role / Specialty
            </label>
            <input
              type="text"
              placeholder="e.g. Short-Form Video Producer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rate / Video (₹)
              </label>
              <input
                type="number"
                min="0"
                value={ratePerVideo}
                onChange={(e) => setRatePerVideo(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Base (₹)
              </label>
              <input
                type="number"
                min="0"
                value={dailySalary}
                onChange={(e) => setDailySalary(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Avatar Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
