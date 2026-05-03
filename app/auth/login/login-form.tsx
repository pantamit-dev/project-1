'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/client';
import { Shield, Mail, Lock, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false); return; }
      toast.success('เข้าสู่ระบบสำเร็จ!');
      router.push(redirectTo);
      router.refresh();
    } catch { toast.error('ไม่สามารถเชื่อมต่อได้'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'linear-gradient(135deg, var(--surface) 0%, var(--primary-fixed) 100%)'}}>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background:'var(--primary)'}}><Fingerprint className="w-8 h-8 text-white"/></div>
          <h1 className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>Admin Login</h1>
          <p className="text-sm mt-1" style={{color:'var(--on-surface-variant)'}}>เข้าสู่ระบบแดชบอร์ดผู้ดูแล</p>
        </div>
        {searchParams.get('error') === 'unauthorized' && <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{background:'var(--error-container)',color:'var(--on-error-container)'}}>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>}
        <form onSubmit={handleLogin} className="space-y-4 p-6 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
          <div><label className="flex items-center gap-2 text-sm font-medium mb-2" style={{color:'var(--on-surface)'}}><Mail className="w-4 h-4"/>อีเมล</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/></div>
          <div><label className="flex items-center gap-2 text-sm font-medium mb-2" style={{color:'var(--on-surface)'}}><Lock className="w-4 h-4"/>รหัสผ่าน</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'var(--surface-container)',color:'var(--on-surface)',border:'1px solid var(--outline-variant)'}}/></div>
          <motion.button whileTap={{scale:0.98}} type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50" style={{background:'var(--primary)',color:'var(--on-primary)'}}><Shield className="w-4 h-4"/>{loading?'กำลังเข้าสู่ระบบ...':'เข้าสู่ระบบ'}</motion.button>
        </form>
        <p className="text-center mt-6 text-sm" style={{color:'var(--on-surface-variant)'}}><Link href="/" className="hover:underline" style={{color:'var(--primary)'}}>← กลับหน้าหลัก</Link></p>
      </motion.div>
    </div>
  );
}
