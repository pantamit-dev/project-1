'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Users,
  FileText,
  Settings,
  LogOut,
  Scan,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'ภาพรวม', labelEn: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/monitoring', label: 'ตรวจสอบสด', labelEn: 'Live Monitor', icon: Activity },
  { href: '/admin/users', label: 'จัดการผู้ใช้', labelEn: 'Users', icon: Users },
  { href: '/admin/reports', label: 'รายงาน', labelEn: 'Reports', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside
      className={`flex flex-col h-screen glass-sidebar transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
        >
          <Scan className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-[var(--on-surface)] truncate">Face Scan</h1>
            <p className="text-[10px] text-[var(--on-surface-variant)] truncate">Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'text-white'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #005EB8, #4285F4)' } : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[var(--on-surface-variant)] group-hover:text-[var(--primary)]'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--outline-variant)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-all w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>ย่อเมนู</span>}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--error)] hover:bg-[var(--error-container)] transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
