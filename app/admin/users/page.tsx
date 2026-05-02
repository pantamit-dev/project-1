'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/client';
import type { Profile } from '@/lib/types/database';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  UserPlus,
  Filter,
  Scan,
} from 'lucide-react';
import { getCurrentSession, SESSIONS } from '@/lib/session-utils';

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [manualCheckInModal, setManualCheckInModal] = useState<Profile | null>(null);
  const [manualSession, setManualSession] = useState<number>(1);

  const supabase = createClient();

  const fetchProfiles = useCallback(async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery.trim()) {
      query = query.or(`full_name.ilike.%${searchQuery}%,student_id.ilike.%${searchQuery}%`);
    }

    const { data } = await query;
    setProfiles((data as Profile[]) || []);
    setLoading(false);
  }, [searchQuery, statusFilter, supabase]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const toggleStatus = async (profile: Profile, newStatus: 'approved' | 'blocked') => {
    setActionLoading(profile.id);
    
    await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', profile.id);

    await fetchProfiles();
    setActionLoading(null);
  };

  const handleManualCheckIn = async () => {
    if (!manualCheckInModal) return;
    setActionLoading(manualCheckInModal.id);

    await supabase.from('check_ins').insert({
      user_id: manualCheckInModal.id,
      session_number: manualSession,
      status: 'success',
    });

    setManualCheckInModal(null);
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#E8F5E9', color: 'var(--success)' }}>
            <CheckCircle2 className="w-3 h-3" /> อนุมัติ
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#FFF8E1', color: 'var(--warning)' }}>
            <Clock className="w-3 h-3" /> รอตรวจสอบ
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#FFEBEE', color: 'var(--error)' }}>
            <XCircle className="w-3 h-3" /> ระงับ
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">จัดการผู้ใช้</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">User Management</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--primary-fixed)' }}>
          <Users className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--primary)]">{profiles.length} ผู้ใช้</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            id="user-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อหรือรหัส..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
          />
        </div>

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--surface-container)' }}>
          {['all', 'pending', 'approved', 'blocked'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
              }`}
            >
              {filter === 'all' ? 'ทั้งหมด' : filter === 'pending' ? 'รอตรวจ' : filter === 'approved' ? 'อนุมัติ' : 'ระงับ'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-container)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">ผู้ใช้</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">รหัส</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">ใบหน้า</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">ลงทะเบียน</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--surface-container)' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--on-surface-variant)]">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-[var(--outline-variant)]" />
                    <p className="text-sm text-[var(--on-surface-variant)]">ไม่พบผู้ใช้</p>
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[var(--surface-container)] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-[var(--on-surface)]">{profile.full_name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-[var(--on-surface-variant)] font-mono">{profile.student_id}</span>
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(profile.status)}</td>
                    <td className="px-5 py-3">
                      {profile.face_descriptor ? (
                        <span className="text-xs text-[var(--success)]">✓ บันทึกแล้ว</span>
                      ) : (
                        <span className="text-xs text-[var(--outline)]">— ไม่มี</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-[var(--on-surface-variant)]">
                        {new Date(profile.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {profile.status !== 'approved' && (
                          <button
                            onClick={() => toggleStatus(profile, 'approved')}
                            disabled={actionLoading === profile.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm"
                            style={{ background: '#E8F5E9', color: 'var(--success)' }}
                          >
                            อนุมัติ
                          </button>
                        )}
                        {profile.status !== 'blocked' && (
                          <button
                            onClick={() => toggleStatus(profile, 'blocked')}
                            disabled={actionLoading === profile.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm"
                            style={{ background: '#FFEBEE', color: 'var(--error)' }}
                          >
                            ระงับ
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setManualCheckInModal(profile);
                            const cs = getCurrentSession();
                            setManualSession(cs?.id || 1);
                          }}
                          disabled={profile.status !== 'approved'}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm disabled:opacity-40"
                          style={{ background: 'var(--primary-fixed)', color: 'var(--primary)' }}
                        >
                          <Scan className="w-3.5 h-3.5 inline mr-1" />
                          ลงเวลา
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Check-in Modal */}
      {manualCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-sm w-full mx-4 animate-success-pop">
            <h3 className="text-lg font-bold text-[var(--on-surface)] mb-1">ลงเวลาด้วยตนเอง</h3>
            <p className="text-sm text-[var(--on-surface-variant)] mb-4">
              สำหรับ: <strong>{manualCheckInModal.full_name}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--on-surface)] mb-2">เลือกรอบ</label>
              <div className="space-y-2">
                {SESSIONS.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-[var(--surface-container)]" style={{ background: manualSession === s.id ? 'var(--primary-fixed)' : undefined }}>
                    <input
                      type="radio"
                      name="session"
                      value={s.id}
                      checked={manualSession === s.id}
                      onChange={() => setManualSession(s.id)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--on-surface)]">{s.labelTh} ({s.start} - {s.end})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setManualCheckInModal(null)}
                className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-[var(--surface-container)]"
                style={{ borderColor: 'var(--outline-variant)' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleManualCheckIn}
                disabled={actionLoading === manualCheckInModal.id}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
              >
                ยืนยันลงเวลา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
