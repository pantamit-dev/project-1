'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/client';
import { SESSIONS, getSessionById, formatScanTime, formatDate } from '@/lib/session-utils';
import type { CheckIn, Profile } from '@/lib/types/database';
import {
  FileText,
  Download,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CheckInWithProfile extends CheckIn {
  profiles: Profile;
}

export default function ReportsPage() {
  const [checkIns, setCheckIns] = useState<CheckInWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalForDay, setTotalForDay] = useState(0);

  const supabase = createClient();

  const fetchCheckIns = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('check_ins')
      .select('*, profiles(*)')
      .gte('scan_time', `${dateFilter}T00:00:00`)
      .lte('scan_time', `${dateFilter}T23:59:59`)
      .order('scan_time', { ascending: false });

    if (sessionFilter !== 'all') {
      query = query.eq('session_number', parseInt(sessionFilter));
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    const typedData = (data || []) as unknown as CheckInWithProfile[];
    setCheckIns(typedData);
    setTotalForDay(typedData.filter((c) => c.status === 'success').length);
    setLoading(false);
  }, [dateFilter, sessionFilter, statusFilter, supabase]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const exportToExcel = () => {
    const exportData = checkIns.map((ci) => ({
      'ชื่อ-นามสกุล': ci.profiles?.full_name || '—',
      'รหัส': ci.profiles?.student_id || '—',
      'รอบ': getSessionById(ci.session_number)?.labelTh || `รอบ ${ci.session_number}`,
      'เวลา': new Date(ci.scan_time).toLocaleString('th-TH'),
      'สถานะ': ci.status === 'success' ? 'สำเร็จ' : ci.status === 'duplicate' ? 'ซ้ำ' : 'ผิดพลาด',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Check-ins');
    XLSX.writeFile(wb, `check-ins_${dateFilter}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['ชื่อ-นามสกุล', 'รหัส', 'รอบ', 'เวลา', 'สถานะ'];
    const rows = checkIns.map((ci) => [
      ci.profiles?.full_name || '—',
      ci.profiles?.student_id || '—',
      getSessionById(ci.session_number)?.labelTh || `รอบ ${ci.session_number}`,
      new Date(ci.scan_time).toLocaleString('th-TH'),
      ci.status === 'success' ? 'สำเร็จ' : ci.status === 'duplicate' ? 'ซ้ำ' : 'ผิดพลาด',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `check-ins_${dateFilter}.csv`;
    link.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />;
      case 'duplicate': return <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />;
      default: return <XCircle className="w-4 h-4 text-[var(--error)]" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">รายงานและบันทึก</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Reports & Logs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition-all hover:bg-[var(--surface-container)]"
            style={{ borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
          />
        </div>

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--surface-container)' }}>
          <button
            onClick={() => setSessionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sessionFilter === 'all' ? 'bg-[var(--primary)] text-white' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            ทุกรอบ
          </button>
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSessionFilter(String(s.id))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sessionFilter === String(s.id) ? 'bg-[var(--primary)] text-white' : 'text-[var(--on-surface-variant)]'
              }`}
            >
              รอบ {s.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--surface-container)' }}>
          {['all', 'success', 'duplicate'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === filter ? 'bg-[var(--primary)] text-white' : 'text-[var(--on-surface-variant)]'
              }`}
            >
              {filter === 'all' ? 'ทุกสถานะ' : filter === 'success' ? 'สำเร็จ' : 'ซ้ำ'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--primary-fixed)' }}>
          <FileText className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--primary)]">
            {formatDate(dateFilter + 'T00:00:00')} — {totalForDay} รายการสำเร็จ
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-container)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">รหัส</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">รอบ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">เวลา</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--surface-container)' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--on-surface-variant)]">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : checkIns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[var(--outline-variant)]" />
                    <p className="text-sm text-[var(--on-surface-variant)]">ไม่มีข้อมูลในวันที่เลือก</p>
                  </td>
                </tr>
              ) : (
                checkIns.map((ci, idx) => (
                  <tr key={ci.id} className="hover:bg-[var(--surface-container)] transition-colors">
                    <td className="px-5 py-3 text-xs text-[var(--outline)]">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-[var(--on-surface)]">
                      {ci.profiles?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--on-surface-variant)] font-mono">
                      {ci.profiles?.student_id || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}>
                        {getSessionById(ci.session_number)?.labelTh || `รอบ ${ci.session_number}`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)]">
                        <Clock className="w-3.5 h-3.5" />
                        {formatScanTime(ci.scan_time)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(ci.status)}
                        <span className="text-xs font-medium">
                          {ci.status === 'success' ? 'สำเร็จ' : ci.status === 'duplicate' ? 'ซ้ำ' : 'ผิดพลาด'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
