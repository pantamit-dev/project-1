'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/client';
import { LayoutDashboard, Activity, Users, FileText, LogOut, Fingerprint, ChevronLeft, Menu } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { href:'/admin', label:'ภาพรวม', icon:LayoutDashboard },
  { href:'/admin/monitoring', label:'ติดตาม Real-time', icon:Activity },
  { href:'/admin/users', label:'จัดการผู้ใช้', icon:Users },
  { href:'/admin/reports', label:'รายงาน', icon:FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('ออกจากระบบแล้ว');
    router.push('/');
    router.refresh();
  }

  return (
    <motion.aside animate={{width:collapsed?72:256}} className="h-screen flex flex-col border-r overflow-hidden" style={{background:'var(--surface-container-lowest)',borderColor:'var(--outline-variant)'}}>
      <div className="p-4 flex items-center gap-3 border-b" style={{borderColor:'var(--outline-variant)'}}>
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{background:'var(--primary)'}}><Fingerprint className="w-5 h-5 text-white"/></div>
        {!collapsed && <span className="font-bold text-sm" style={{color:'var(--on-surface)'}}>FaceScan Admin</span>}
        <button onClick={()=>setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg hover:bg-black/5" style={{color:'var(--on-surface-variant)'}}>{collapsed?<Menu className="w-4 h-4"/>:<ChevronLeft className="w-4 h-4"/>}</button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive?'':'hover:bg-black/5'}`} style={isActive?{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}:{color:'var(--on-surface-variant)'}}>
              <item.icon className="w-5 h-5 flex-shrink-0"/>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t" style={{borderColor:'var(--outline-variant)'}}>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full hover:bg-red-50 transition-all" style={{color:'var(--error-red)'}}>
          <LogOut className="w-5 h-5 flex-shrink-0"/>
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </motion.aside>
  );
}
