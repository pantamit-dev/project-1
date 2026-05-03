'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/client';
import { getSessionById, formatScanTime, formatDate, SESSIONS } from '@/lib/session-utils';
import { FileText, Download, Search, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CheckIn } from '@/lib/types/database';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0]; });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionFilter, setSessionFilter] = useState<number|0>(0);
  const [searchName, setSearchName] = useState('');
  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    const from = new Date(dateFrom); from.setHours(0,0,0,0);
    const to = new Date(dateTo); to.setHours(23,59,59,999);
    let q = supabase.from('check_ins').select('*, profiles(name,employee_id)').gte('scan_time',from.toISOString()).lte('scan_time',to.toISOString()).order('scan_time',{ascending:false});
    if (sessionFilter > 0) q = q.eq('session_number', sessionFilter);
    const {data} = await q;
    let filtered = data || [];
    if (searchName) filtered = filtered.filter(c => c.profiles?.name?.toLowerCase().includes(searchName.toLowerCase()) || c.profiles?.employee_id?.toLowerCase().includes(searchName.toLowerCase()));
    setCheckins(filtered);
    setLoading(false);
  }, [dateFrom, dateTo, sessionFilter, searchName]);

  useEffect(() => { loadData(); }, [loadData]);

  function exportCSV() {
    if (checkins.length===0){toast.error('ไม่มีข้อมูล');return;}
    const rows = checkins.map(c => ({
      ชื่อ: c.profiles?.name || '',
      รหัสพนักงาน: c.profiles?.employee_id || '',
      รอบ: getSessionById(c.session_number)?.labelTh || '',
      เวลา: formatScanTime(c.scan_time),
      วันที่: formatDate(c.scan_time),
      สถานะ: c.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, `report_${dateFrom}_${dateTo}.xlsx`);
    toast.success('ดาวน์โหลดสำเร็จ!');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>รายงานการลงเวลา</h1><p className="text-sm mt-1" style={{color:'var(--on-surface-variant)'}}>ค้นหาและส่งออกข้อมูลการลงเวลา</p></div>
        <motion.button whileTap={{scale:0.98}} onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{background:'var(--primary)',color:'var(--on-primary)'}}><Download className="w-4 h-4"/>ส่งออก Excel</motion.button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{color:'var(--on-surface-variant)'}}/><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/><span className="text-sm" style={{color:'var(--on-surface-variant)'}}>ถึง</span><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/></div>
        <select value={sessionFilter} onChange={e=>setSessionFilter(Number(e.target.value))} className="px-3 py-2 rounded-lg text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}><option value={0}>ทุกรอบ</option>{SESSIONS.map(s=><option key={s.id} value={s.id}>{s.labelTh}</option>)}</select>
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--on-surface-variant)'}}/><input type="text" value={searchName} onChange={e=>setSearchName(e.target.value)} placeholder="ค้นหาชื่อ/รหัส..." className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/></div>
      </div>
      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
        <div className="p-4 border-b flex items-center justify-between" style={{borderColor:'var(--outline-variant)'}}><span className="text-sm font-bold flex items-center gap-2" style={{color:'var(--on-surface)'}}><FileText className="w-4 h-4"/>ข้อมูลการลงเวลา</span><span className="text-xs px-2 py-0.5 rounded-full" style={{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}}>{checkins.length} รายการ</span></div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0" style={{background:'var(--surface-container)'}}><tr>
              {['ชื่อ','รหัส','รอบ','เวลา','วันที่','สถานะ'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>{h}</th>)}
            </tr></thead>
            <tbody className="divide-y" style={{borderColor:'var(--outline-variant)'}}>
              {loading?<tr><td colSpan={6} className="p-8 text-center text-sm" style={{color:'var(--on-surface-variant)'}}>กำลังโหลด...</td></tr>:checkins.length===0?<tr><td colSpan={6} className="p-8 text-center text-sm" style={{color:'var(--on-surface-variant)'}}>ไม่พบข้อมูล</td></tr>:checkins.map((c,i)=>(
                <tr key={c.id||i} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium" style={{color:'var(--on-surface)'}}>{c.profiles?.name||'-'}</td>
                  <td className="px-4 py-3 text-sm" style={{color:'var(--on-surface-variant)'}}>{(c.profiles as any)?.employee_id||'-'}</td>
                  <td className="px-4 py-3 text-xs">{getSessionById(c.session_number)?.labelTh||`รอบ ${c.session_number}`}</td>
                  <td className="px-4 py-3 text-sm font-mono" style={{color:'var(--on-surface)'}}>{formatScanTime(c.scan_time)}</td>
                  <td className="px-4 py-3 text-xs" style={{color:'var(--on-surface-variant)'}}>{formatDate(c.scan_time)}</td>
                  <td className="px-4 py-3"><span className="chip-approved inline-flex px-2 py-0.5 rounded-full text-xs">สำเร็จ</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
