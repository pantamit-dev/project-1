// Database types matching the Supabase schema
export type UserStatus = 'pending' | 'approved' | 'blocked';
export type UserRole = 'user' | 'admin';
export type CheckInStatus = 'success' | 'duplicate' | 'error';

export interface Profile {
  id: string;
  auth_id: string | null;
  full_name: string;
  student_id: string;
  face_descriptor: number[] | null; // 128-float array from face-api.js
  avatar_url: string | null;
  status: UserStatus;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  session_number: 1 | 2 | 3;
  scan_time: string;
  status: CheckInStatus;
  created_at: string;
  // Joined fields (optional)
  profiles?: Profile;
}

export interface Session {
  id: 1 | 2 | 3;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  label: string;
  labelTh: string;
}

export interface CheckInResult {
  success: boolean;
  type: 'success' | 'duplicate' | 'no_match' | 'no_session' | 'not_approved' | 'error';
  message: string;
  user?: Profile;
  session?: Session;
}

// Supabase Realtime payload
export interface RealtimeCheckIn {
  eventType: 'INSERT';
  new: CheckIn;
}
