import type { Session } from '@/lib/types/database';

export const SESSIONS: Session[] = [
  { id: 1, start: '08:00', end: '12:00', label: 'Session 1 (Morning)', labelTh: 'รอบที่ 1 (เช้า)' },
  { id: 2, start: '13:00', end: '16:00', label: 'Session 2 (Afternoon)', labelTh: 'รอบที่ 2 (บ่าย)' },
  { id: 3, start: '17:00', end: '22:00', label: 'Session 3 (Evening)', labelTh: 'รอบที่ 3 (เย็น)' },
];

/**
 * Parse "HH:mm" string into hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Get the current active session based on current time
 * Returns null if no session is active
 */
export function getCurrentSession(now: Date = new Date()): Session | null {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  for (const session of SESSIONS) {
    const start = parseTime(session.start);
    const end = parseTime(session.end);
    const startTotal = start.hours * 60 + start.minutes;
    const endTotal = end.hours * 60 + end.minutes;

    if (currentTotalMinutes >= startTotal && currentTotalMinutes < endTotal) {
      return session;
    }
  }

  return null;
}

/**
 * Get session by ID
 */
export function getSessionById(id: number): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

/**
 * Check if a given time falls within any session
 */
export function isWithinAnySession(time: Date = new Date()): boolean {
  return getCurrentSession(time) !== null;
}

/**
 * Get the status of all sessions for display
 */
export function getSessionStatuses(now: Date = new Date()): Array<Session & { isActive: boolean; isPast: boolean }> {
  const currentSession = getCurrentSession(now);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  return SESSIONS.map((session) => {
    const end = parseTime(session.end);
    const endTotal = end.hours * 60 + end.minutes;

    return {
      ...session,
      isActive: currentSession?.id === session.id,
      isPast: currentTotalMinutes >= endTotal,
    };
  });
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Format a timestamp for display
 */
export function formatScanTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date for display
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
