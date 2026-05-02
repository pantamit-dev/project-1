'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { getSessionStatuses, getCurrentSession, SESSIONS } from '@/lib/session-utils';
import type { Session } from '@/lib/types/database';
import {
  Users,
  UserCheck,
  Clock,
  Activity,
  TrendingUp,
  Scan,
  CalendarDays,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Stats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  todayCheckIns: number;
  sessionCounts: { session: number; count: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    todayCheckIns: 0,
    sessionCounts: [],
  });
  const [sessionStatuses, setSessionStatuses] = useState(getSessionStatuses());
  const [currentSession, setCurrentSession] = useState<Session | null>(getCurrentSession());
  const [time, setTime] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setCurrentSession(getCurrentSession(now));
      setSessionStatuses(getSessionStatuses(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Approved users
      const { count: approvedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Pending users
      const { count: pendingUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Today's check-ins
      const { data: todayCheckins } = await supabase
        .from('check_ins')
        .select('session_number')
        .eq('status', 'success')
        .gte('scan_time', `${today}T00:00:00`)
        .lte('scan_time', `${today}T23:59:59`);

      // Count per session
      const sessionCounts = SESSIONS.map((s) => ({
        session: s.id,
        count: todayCheckins?.filter((c) => c.session_number === s.id).length || 0,
      }));

      // Weekly data (last 7 days)
      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const { count } = await supabase
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'success')
          .gte('scan_time', `${dateStr}T00:00:00`)
          .lte('scan_time', `${dateStr}T23:59:59`);

        weekDays.push({
          day: d.toLocaleDateString('th-TH', { weekday: 'short' }),
          count: count || 0,
        });
      }

      setStats({
        totalUsers: totalUsers || 0,
        approvedUsers: approvedUsers || 0,
        pendingUsers: pendingUsers || 0,
        todayCheckIns: todayCheckins?.length || 0,
        sessionCounts,
      });
      setWeeklyData(weekDays);
      setLoading(false);
    }

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const PIE_COLORS = ['#005EB8', '#4285F4', '#534062'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">ภาพรวมแดชบอร์ด</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Dashboard Overview</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-[var(--primary)]">
            {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-[var(--on-surface-variant)]">
            {time.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'ผู้ใช้ทั้งหมด', value: stats.totalUsers, icon: Users, color: '#005EB8', bg: '#d6e3ff' },
          { label: 'อนุมัติแล้ว', value: stats.approvedUsers, icon: UserCheck, color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'เข้างานวันนี้', value: stats.todayCheckIns, icon: Scan, color: '#4285F4', bg: '#E3F2FD' },
          { label: 'รอตรวจสอบ', value: stats.pendingUsers, icon: Clock, color: '#F57F17', bg: '#FFF8E1' },
        ].map((card) => (
          <div
            key={card.label}
            className="stats-card glass-card p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: card.bg }}
            >
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-[var(--on-surface)]">
                {loading ? '—' : card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Session Timeline */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
          สถานะรอบเวลาเข้างาน
        </h3>
        <div className="flex gap-3">
          {sessionStatuses.map((s) => {
            const count = stats.sessionCounts.find((sc) => sc.session === s.id)?.count || 0;
            return (
              <div
                key={s.id}
                className={`flex-1 p-4 rounded-xl text-center transition-all ${
                  s.isActive ? 'session-active' : s.isPast ? 'session-past' : 'session-upcoming'
                }`}
              >
                <p className="text-xs font-medium opacity-80 mb-1">{s.labelTh}</p>
                <p className="text-lg font-bold">{s.start} - {s.end}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{count} คน</span>
                </div>
                {s.isActive && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    <Activity className="w-3 h-3" />
                    กำลังดำเนินการ
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Bar Chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            สถิติเข้างานรายสัปดาห์
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#005EB8" radius={[4, 4, 0, 0]} name="เข้างาน" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--primary)]" />
            สัดส่วนรายรอบ
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sessionCounts.map((sc) => ({
                    name: SESSIONS.find((s) => s.id === sc.session)?.labelTh || `รอบ ${sc.session}`,
                    value: sc.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.sessionCounts.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {stats.sessionCounts.map((sc, idx) => (
              <div key={sc.session} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[idx] }} />
                  <span className="text-[var(--on-surface-variant)]">
                    {SESSIONS.find((s) => s.id === sc.session)?.labelTh}
                  </span>
                </div>
                <span className="font-medium text-[var(--on-surface)]">{sc.count} คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
