'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scan, UserPlus, LayoutDashboard, Shield, Clock, Users, ChevronRight, Fingerprint } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f9f9ff 0%, #e7e8f0 50%, #d6e3ff 100%)' }}>
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>
              FaceScan
            </span>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-lg"
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
          >
            <Shield className="w-4 h-4" />
            เข้าสู่ระบบ Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="pt-32 pb-16 px-6"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'var(--primary-fixed)',
                color: 'var(--on-primary-fixed)',
              }}
            >
              <Scan className="w-4 h-4" />
              AI Facial Recognition Technology
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--on-surface)' }}
          >
            ระบบลงเวลา
            <br />
            <span style={{ color: 'var(--primary)' }}>ด้วยใบหน้า AI</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            ระบบลงเวลาเข้า-ออกงานด้วยเทคโนโลยีจดจำใบหน้า AI
            รวดเร็ว แม่นยำ ปลอดภัย พร้อมแดชบอร์ดสำหรับผู้ดูแลระบบ
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                color: 'var(--on-primary)',
              }}
            >
              <UserPlus className="w-5 h-5" />
              ลงทะเบียนพนักงาน
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kiosk"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--surface-container-lowest)',
                color: 'var(--primary)',
                border: '2px solid var(--outline-variant)',
              }}
            >
              <Scan className="w-5 h-5" />
              เปิดตู้สแกนใบหน้า
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Cards */}
      <motion.section
        className="py-16 px-6"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: 'var(--on-surface)' }}
          >
            ฟีเจอร์หลัก
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: UserPlus,
                title: 'ลงทะเบียนผู้ใช้',
                desc: 'ลงทะเบียนด้วยมือถือ ถ่ายรูปใบหน้าเพื่อสร้าง Face ID ส่วนตัว',
                href: '/register',
                color: 'var(--primary)',
                bg: 'var(--primary-fixed)',
              },
              {
                icon: Scan,
                title: 'ตู้สแกนเข้างาน',
                desc: 'สแกนใบหน้าอัตโนมัติ ลงเวลาใน 3 รอบต่อวัน ป้องกันสแกนซ้ำ',
                href: '/kiosk',
                color: 'var(--success-green)',
                bg: '#e8f5e9',
              },
              {
                icon: LayoutDashboard,
                title: 'แดชบอร์ด Admin',
                desc: 'ดูสถิติ ติดตามแบบ real-time จัดการผู้ใช้ และส่งออกรายงาน',
                href: '/admin',
                color: 'var(--tertiary)',
                bg: 'var(--tertiary-fixed)',
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Link
                  href={feature.href}
                  className="block p-6 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 h-full"
                  style={{
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid var(--outline-variant)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: feature.bg }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--on-surface)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    {feature.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Key Features Grid */}
      <motion.section
        className="py-16 px-6"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Scan, label: 'จดจำใบหน้า AI', value: 'Face API' },
              { icon: Clock, label: '3 รอบเวลา', value: 'เช้า/บ่าย/เย็น' },
              { icon: Shield, label: 'ป้องกันซ้ำ', value: 'Duplicate Check' },
              { icon: Users, label: 'จัดการผู้ใช้', value: 'Admin Panel' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-6 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--outline-variant)' }}
              >
                <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                <div className="font-bold text-sm" style={{ color: 'var(--on-surface)' }}>
                  {item.label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm" style={{ color: 'var(--on-surface-variant)' }}>
        <p>© 2026 AI Face Scan Check-in System. Powered by face-api.js & Supabase.</p>
      </footer>
    </div>
  );
}
