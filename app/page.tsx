import Link from 'next/link';
import { Scan, UserPlus, LayoutDashboard, Shield, Clock, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f9f9ff 0%, #d6e3ff 50%, #c9e3fa 100%)' }}>
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)', boxShadow: '0 8px 32px rgba(0, 94, 184, 0.3)' }}>
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-3">
            AI Face Scan
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-lg mx-auto">
            ระบบลงเวลาเข้างานด้วยใบหน้า AI — สะดวก รวดเร็ว ปลอดภัย
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              href: '/register',
              icon: UserPlus,
              title: 'ลงทะเบียนใหม่',
              titleEn: 'Self Registration',
              description: 'ลงทะเบียนด้วยตนเองพร้อมบันทึกใบหน้า',
              gradient: 'linear-gradient(135deg, #005EB8, #4285F4)',
              bg: '#d6e3ff',
            },
            {
              href: '/kiosk',
              icon: Scan,
              title: 'จุดสแกนเข้างาน',
              titleEn: 'Kiosk Scanner',
              description: 'สแกนใบหน้าเพื่อลงเวลาเข้างานอัตโนมัติ',
              gradient: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
              bg: '#E8F5E9',
            },
            {
              href: '/admin',
              icon: LayoutDashboard,
              title: 'แดชบอร์ดผู้ดูแล',
              titleEn: 'Admin Dashboard',
              description: 'ตรวจสอบ จัดการผู้ใช้ และดูรายงาน',
              gradient: 'linear-gradient(135deg, #534062, #6c587b)',
              bg: '#ead1fa',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group glass-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: card.bg }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.gradient.includes('#005EB8') ? '#005EB8' : card.gradient.includes('#2E7D32') ? '#2E7D32' : '#534062' }} />
              </div>
              <h3 className="text-lg font-bold text-[var(--on-surface)] mb-0.5">{card.title}</h3>
              <p className="text-xs text-[var(--primary)] font-medium mb-2">{card.titleEn}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-[var(--on-surface)] text-center mb-8">คุณสมบัติหลัก</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'ปลอดภัยด้วย AI', desc: 'จดจำใบหน้าด้วย AI ป้องกันการปลอมแปลง' },
              { icon: Clock, title: '3 รอบเวลาอัตโนมัติ', desc: 'ระบบตรวจสอบรอบเวลาและป้องกันสแกนซ้ำ' },
              { icon: Users, title: 'จัดการง่าย', desc: 'แดชบอร์ดแบบเรียลไทม์พร้อมส่งออกรายงาน' },
            ].map((feat) => (
              <div key={feat.title} className="text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--primary-fixed)' }}>
                  <feat.icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--on-surface)] mb-1">{feat.title}</h3>
                <p className="text-xs text-[var(--on-surface-variant)]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-xs text-[var(--on-surface-variant)]">© 2026 AI Face Scan Check-in System — Powered by Next.js, Supabase & Vercel</p>
      </footer>
    </div>
  );
}
