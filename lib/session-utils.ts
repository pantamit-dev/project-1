import type { Session } from '@/lib/types/database';

export const SESSIONS: Session[] = [
  { id: 1, start: '08:00', end: '12:00', label: 'Session 1 (Morning)', labelTh: 'รอบที่ 1 (เช้า)' },
  { id: 2, start: '13:00', end: '16:00', label: 'Session 2 (Afternoon)', labelTh: 'รอบที่ 2 (บ่าย)' },
  { id: 3, start: '17:00', end: '22:00', label: 'Session 3 (Evening)', labelTh: 'รอบที่ 3 (เย็น)' },
];

/**
 * Get the current active session based on server time.
 */
export function getCurrentSession(): Session | null {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  for (const session of SESSIONS) {
    if (currentTime >= session.start && currentTime < session.end) {
      return session;
    }
  }
  return null;
}

/**
 * Get session status for all sessions (active, upcoming, completed).
 */
export function getSessionStatuses(): { session: Session; status: 'active' | 'upcoming' | 'completed' }[] {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return SESSIONS.map((session) => {
    if (currentTime >= session.start && currentTime < session.end) {
      return { session, status: 'active' as const };
    } else if (currentTime < session.start) {
      return { session, status: 'upcoming' as const };
    } else {
      return { session, status: 'completed' as const };
    }
  });
}

/**
 * Get a session by its ID number.
 */
export function getSessionById(id: number): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

/**
 * Format scan time for display.
 */
export function formatScanTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date for display.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today's date range for queries.
 */
export function getTodayRange(): { start: string; end: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    start: today.toISOString(),
    end: tomorrow.toISOString(),
  };
}
