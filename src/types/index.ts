export interface Employee {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  ratePerVideo?: number; // e.g. 50 (INR / Currency)
  dailySalary?: number;
  monthlySalary?: number;
  color?: string; // Accent color for avatars/tags
}

export interface Account {
  id: string;
  username: string; // e.g. "@tech_clips"
  targetDailyClips: number; // e.g. 3
  employeeId?: string; // assigned team member
  campaignId: string;
  niche?: string;
}

export interface Campaign {
  id: string;
  name: string;
  clientName: string;
}

export interface DailyRecord {
  id: string; // `${date}_${accountId}`
  date: string; // YYYY-MM-DD
  accountId: string;
  uploadedClips: number;
  updatedAt: number; // timestamp
}

export type DateRangeType = '3' | '4' | '7' | '14' | '30' | 'month';

export type ThemeMode = 'dark' | 'light';
export type TileStyle = 'translucent' | 'solid' | 'minimal';

export interface DayAccountUpload {
  account: Account;
  uploaded: number;
  target: number;
}

export interface EmployeeDailySummary {
  date: string;
  totalUploaded: number;
  totalTarget: number;
  status: 'met' | 'partial' | 'missed' | 'none';
  accounts: DayAccountUpload[];
}
