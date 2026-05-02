'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/client';
import { formatScanTime, getSessionById } from '@/lib/session-utils';
import type { CheckIn, Profile } from '@/lib/types/database';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Wifi, Users, Clock } from 'lucide-react';

interface LiveEvent {
  checkIn: CheckIn;
  profile: Profile | null;
  timestamp: string;
}

export default function MonitoringPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch existing today's check-ins
    async function fetchExisting() {
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*, profiles(*)')
        .gte('scan_time', `${today}T00:00:00`)
        .lte('scan_time', `${today}T23:59:59`)
        .order('scan_time', { ascending: false })
        .limit(50);

      if (checkIns) {
        const mappedEvents: LiveEvent[] = checkIns.map((ci: Record<string, unknown>) => ({
          checkIn: ci as unknown as CheckIn,
          profile: (ci as Record<string, unknown>).profiles as Profile | null,
          timestamp: (ci as Record<string, unknown>).scan_time as string,
        }));
        setEvents(mappedEvents);
        setTodayCount(checkIns.filter((c: Record<string, unknown>) => c.status === 'success').length);
      }
    }

    fetchExisting();

    // Subscribe to realtime
    const channel = supabase
      .channel('check_ins_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_ins',
        },
        async (payload) => {
          const newCheckIn = payload.new as CheckIn;

          // Fetch the profile for this check-in
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newCheckIn.user_id)
            .single();

          const newEvent: LiveEvent = {
            checkIn: newCheckIn,
            profile: profile as Profile | null,
            timestamp: newCheckIn.scan_time,
          };

          setEvents((prev) => [newEvent, ...prev].slice(0, 100));

          if (newCheckIn.status === 'success') {
            setTodayCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />;
      case 'duplicate': return <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />;
      default: return <XCircle className="w-5 h-5 text-[var(--error)]" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'สำเร็จ';
      case 'duplicate': return 'ซ้ำ';
      default: return 'ผิดพลาด';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success': return '#E8F5E9';
      case 'duplicate': return '#FFF8E1';
      default: return '#FFEBEE';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">ตรวจสอบแบบเรียลไทม์</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Real-time Monitoring Board</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: connected ? '#E8F5E9' : '#FFEBEE' }}>
            <Wifi className={`w-4 h-4 ${connected ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} />
            <span className={`text-xs font-medium ${connected ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {connected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--primary-fixed)' }}>
            <Users className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-medium text-[var(--primary)]">วันนี้: {todayCount} คน</span>
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
          <Activity className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-sm font-bold text-[var(--on-surface)]">กิจกรรมล่าสุด</h3>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--error)]'}`} />
        </div>

        <div ref={feedRef} className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {events.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 text-[var(--outline-variant)]" />
              <p className="text-sm text-[var(--on-surface-variant)]">ยังไม่มีกิจกรรมวันนี้</p>
              <p className="text-xs text-[var(--outline)] mt-1">รอการสแกนใบหน้าจากจุดลงทะเบียน</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--surface-container)' }}>
              {events.map((event, idx) => (
                <div
                  key={`${event.checkIn.id}-${idx}`}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-[var(--surface-container)] transition-colors live-feed-item"
                >
                  {/* Status Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: getStatusBg(event.checkIn.status) }}
                  >
                    {getStatusIcon(event.checkIn.status)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--on-surface)] truncate">
                      {event.profile?.full_name || 'ไม่ทราบชื่อ'}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      {event.profile?.student_id || '—'} • {getSessionById(event.checkIn.session_number)?.labelTh || `รอบ ${event.checkIn.session_number}`}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: getStatusBg(event.checkIn.status),
                      color: event.checkIn.status === 'success' ? 'var(--success)' : event.checkIn.status === 'duplicate' ? 'var(--warning)' : 'var(--error)',
                    }}
                  >
                    {getStatusLabel(event.checkIn.status)}
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1 text-xs text-[var(--on-surface-variant)]">
                    <Clock className="w-3.5 h-3.5" />
                    {formatScanTime(event.checkIn.scan_time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
