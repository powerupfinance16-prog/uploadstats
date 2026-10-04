import { Employee, Account, Campaign, DailyRecord } from '../types';
import { TODAY_STR, parseDateString, toDateString } from '../utils/dateUtils';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'camp1', name: 'AI & Tech Growth', clientName: 'SynthLabs Global' },
  { id: 'camp2', name: 'Fitness Blitz', clientName: 'Apex Athletic' },
  { id: 'camp3', name: 'Finance & Wealth', clientName: 'Capital Alpha' },
  { id: 'camp4', name: 'Visual Motion', clientName: 'Creator Studio' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp1',
    name: 'Rahul Sharma',
    role: 'Lead Reels Editor',
    ratePerVideo: 50,
    dailySalary: 300,
    monthlySalary: 25000,
    color: '#10B981', // Emerald
  },
  {
    id: 'emp2',
    name: 'Aman Verma',
    role: 'Short-Form Specialist',
    ratePerVideo: 50,
    dailySalary: 250,
    monthlySalary: 22000,
    color: '#3B82F6', // Blue
  },
  {
    id: 'emp3',
    name: 'Priya Patel',
    role: 'Growth Video Strategist',
    ratePerVideo: 60,
    dailySalary: 350,
    monthlySalary: 28000,
    color: '#8B5CF6', // Purple
  },
  {
    id: 'emp4',
    name: 'Sneha Nair',
    role: 'Motion & Clips Editor',
    ratePerVideo: 45,
    dailySalary: 200,
    monthlySalary: 20000,
    color: '#EC4899', // Pink
  },
  {
    id: 'emp5',
    name: 'Vikram Roy',
    role: 'Creative Video Artist',
    ratePerVideo: 55,
    dailySalary: 275,
    monthlySalary: 24000,
    color: '#F59E0B', // Amber
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc1',
    username: '@tech_reels',
    targetDailyClips: 3,
    employeeId: 'emp1',
    campaignId: 'camp1',
    niche: 'AI & Tech News',
  },
  {
    id: 'acc2',
    username: '@daily_clips',
    targetDailyClips: 3,
    employeeId: 'emp1',
    campaignId: 'camp1',
    niche: 'Productivity Tech',
  },
  {
    id: 'acc3',
    username: '@fitness_daily',
    targetDailyClips: 4,
    employeeId: 'emp2',
    campaignId: 'camp2',
    niche: 'Workouts & Nutrition',
  },
  {
    id: 'acc4',
    username: '@wealth_mindset',
    targetDailyClips: 3,
    employeeId: 'emp3',
    campaignId: 'camp3',
    niche: 'Investing & Business',
  },
  {
    id: 'acc5',
    username: '@gadget_trends',
    targetDailyClips: 2,
    employeeId: 'emp4',
    campaignId: 'camp1',
    niche: 'Consumer Electronics',
  },
  {
    id: 'acc6',
    username: '@motion_visuals',
    targetDailyClips: 2,
    employeeId: 'emp5',
    campaignId: 'camp4',
    niche: 'Design & Aesthetics',
  },
  // Unassigned pages
  {
    id: 'acc7',
    username: '@crypto_pulse',
    targetDailyClips: 2,
    employeeId: undefined,
    campaignId: 'camp3',
    niche: 'Web3 & Markets',
  },
  {
    id: 'acc8',
    username: '@foodie_vibes',
    targetDailyClips: 3,
    employeeId: undefined,
    campaignId: 'camp2',
    niche: 'Culinary Shorts',
  },
];

export function generateInitialRecords(): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {};
  const refDate = parseDateString(TODAY_STR);

  // Generate 45 days of historical data up to today
  for (let i = 45; i >= 0; i--) {
    const curDate = new Date(refDate);
    curDate.setDate(refDate.getDate() - i);
    const dateStr = toDateString(curDate);
    const isTodayDate = dateStr === TODAY_STR;
    const dayOfWeek = curDate.getDay(); // 0 is Sunday

    INITIAL_ACCOUNTS.forEach((account) => {
      let uploaded = 0;
      const target = account.targetDailyClips;

      if (isTodayDate) {
        // Today's values matching user prompt specification:
        // Rahul: @tech_reels 3/3, @daily_clips 3/3
        // Aman: @fitness_daily 2/4 (partial)
        // Priya: @wealth_mindset 3/3
        // Sneha: @gadget_trends 2/2
        // Vikram: @motion_visuals 1/2
        // acc7 (@crypto_pulse): 0/2
        // acc8 (@foodie_vibes): 1/3
        if (account.id === 'acc1') uploaded = 3;
        else if (account.id === 'acc2') uploaded = 3;
        else if (account.id === 'acc3') uploaded = 2;
        else if (account.id === 'acc4') uploaded = 3;
        else if (account.id === 'acc5') uploaded = 2;
        else if (account.id === 'acc6') uploaded = 1;
        else if (account.id === 'acc7') uploaded = 0;
        else if (account.id === 'acc8') uploaded = 1;
      } else {
        // Historical deterministic distribution
        // Rahul Sharma (acc1, acc2): very consistent high streak
        if (account.employeeId === 'emp1') {
          // Met target on ~90% of days
          const pseudoRand = (account.id.charCodeAt(3) + i * 17) % 10;
          if (pseudoRand < 8) {
            uploaded = target;
          } else if (pseudoRand === 8) {
            uploaded = Math.max(1, target - 1);
          } else {
            uploaded = target + 1; // Overdelivered
          }
        } else if (account.employeeId === 'emp2') {
          // Aman Verma: high effort, some partials
          const pseudoRand = (account.id.charCodeAt(3) + i * 13) % 10;
          if (pseudoRand < 6) {
            uploaded = target;
          } else if (pseudoRand < 9) {
            uploaded = Math.max(1, target - 2);
          } else {
            uploaded = 0;
          }
        } else if (account.employeeId === 'emp3') {
          // Priya Patel: top performer, steady
          const pseudoRand = (account.id.charCodeAt(3) + i * 23) % 10;
          if (pseudoRand < 9) {
            uploaded = target;
          } else {
            uploaded = target - 1;
          }
        } else if (account.employeeId === 'emp4') {
          // Sneha Nair: consistent
          const pseudoRand = (account.id.charCodeAt(3) + i * 19) % 10;
          if (pseudoRand < 7) {
            uploaded = target;
          } else if (pseudoRand === 7) {
            uploaded = 1;
          } else {
            uploaded = 0;
          }
        } else if (account.employeeId === 'emp5') {
          // Vikram Roy
          const pseudoRand = (account.id.charCodeAt(3) + i * 31) % 10;
          if (pseudoRand < 6) {
            uploaded = target;
          } else {
            uploaded = Math.max(0, target - 1);
          }
        } else {
          // Unassigned accounts: sporadic uploads
          const pseudoRand = (account.id.charCodeAt(3) + i * 7) % 10;
          if (pseudoRand < 3) uploaded = target;
          else if (pseudoRand < 6) uploaded = 1;
          else uploaded = 0;
        }
      }

      const recordId = `${dateStr}_${account.id}`;
      records[recordId] = {
        id: recordId,
        date: dateStr,
        accountId: account.id,
        uploadedClips: uploaded,
        updatedAt: Date.now() - i * 86400000,
      };
    });
  }

  return records;
}
