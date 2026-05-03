'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/client';
import { Users, Search, CheckCircle2, XCircle, Clock, UserCheck, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile, UserStatus } from '@/lib/types/database';
import { formatDate } from '@/lib/session-utils';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|UserStatus>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    let q = supabase.from('profiles').select('*').order('created_at',{ascending:false});
    if (filter !== 'all') q = q.eq('status', filter);
    if (search) q = q.or(`name.ilike.%${search}%,employee_id.ilike.%${search}%`);
    const {data} = await q;
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, [filter, search]);

  async function updateStatus(userId: string, status: UserStatus) {
    const {error} = await supabase.from('profiles').update({status}).eq('id',userId);
    if(error) { toast.error('อัพเดทไม่สำเร็จ'); return; }
    toast.success(status==='approved'?'อนุมัติแล้ว':status==='blocked'?'ระงับแล้ว':'เปลี่ยนสถานะแล้ว');
    loadUsers();
  }

  const statusConfig: Record<UserStatus, {label:string,className:string,icon:typeof CheckCircle2}> = {
    approved: {label:'อนุมัติ',className:'chip-approved',icon:CheckCircle2},
    pending: {label:'รอดำเนินการ',className:'chip-pending',icon:Clock},
    blocked: {label:'ระงับ',className:'chip-blocked',icon:XCircle},
  };

  const filters = [
    {value:'all' as const,label:'ทั้งหมด'},
    {value:'pending' as const,label:'รอดำเนินการ'},
    {value:'approved' as const,label:'อนุมัติแล้ว'},
    {value:'blocked' as const,label:'ระงับ'},
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>จัดการผู้ใช้</h1><p className="text-sm mt-1" style={{color:'var(--on-surface-variant)'}}>อนุมัติ ระงับ หรือจัดการบัญชีพนักงาน</p></div>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--on-surface-variant)'}}/><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาชื่อหรือรหัส..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/></div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f.value} onClick={()=>setFilter(f.value)} className="px-3 py-2 rounded-xl text-xs font-medium transition-all" style={filter===f.value?{background:'var(--primary)',color:'var(--on-primary)'}:{background:'var(--surface-container)',color:'var(--on-surface-variant)',border:'1px solid var(--outline-variant)'}}>{f.label}</button>
          ))}
        </div>
      </div>
      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{background:'var(--surface-container)'}}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>ชื่อ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>รหัสพนักงาน</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>สถานะ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>ลงทะเบียน</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{color:'var(--on-surface-variant)'}}>การดำเนินการ</th>
            </tr></thead>
            <tbody className="divide-y" style={{borderColor:'var(--outline-variant)'}}>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm" style={{color:'var(--on-surface-variant)'}}>กำลังโหลด...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm" style={{color:'var(--on-surface-variant)'}}>ไม่พบข้อมูล</td></tr>
              ) : users.map(user => {
                const sc = statusConfig[user.status];
                return (
                  <motion.tr key={user.id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}}>{user.name[0]}</div><span className="text-sm font-medium" style={{color:'var(--on-surface)'}}>{user.name}</span></div></td>
                    <td className="px-4 py-3 text-sm" style={{color:'var(--on-surface-variant)'}}>{user.employee_id}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sc.className}`}><sc.icon className="w-3 h-3"/>{sc.label}</span></td>
                    <td className="px-4 py-3 text-xs" style={{color:'var(--on-surface-variant)'}}>{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      {user.status !== 'approved' && <button onClick={()=>updateStatus(user.id,'approved')} className="p-1.5 rounded-lg hover:bg-green-50" title="อนุมัติ"><UserCheck className="w-4 h-4" style={{color:'var(--success-green)'}}/></button>}
                      {user.status !== 'blocked' && <button onClick={()=>updateStatus(user.id,'blocked')} className="p-1.5 rounded-lg hover:bg-red-50" title="ระงับ"><Ban className="w-4 h-4" style={{color:'var(--error-red)'}}/></button>}
                    </div></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
