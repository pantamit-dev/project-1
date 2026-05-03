// Database types matching the Supabase schema
export type UserStatus = 'pending' | 'approved' | 'blocked';
export type UserRole = 'user' | 'admin';
export type CheckInStatus = 'success' | 'duplicate' | 'error';

export interface Profile {
  id: string;
  name: string;
  employee_id: string;
  face_descriptor: number[] | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  session_number: number;
  scan_time: string;
  status: CheckInStatus;
  created_at: string;
  // Joined fields
  profiles?: Profile;
}

export interface Session {
  id: number;
  start: string;
  end: string;
  label: string;
  labelTh: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  messageTh: string;
  user?: Profile;
  session?: Session;
}

export interface DashboardStats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  todayCheckIns: number;
  currentSession: Session | null;
  sessionCounts: { session: number; count: number }[];
}
