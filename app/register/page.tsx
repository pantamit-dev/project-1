'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/client';
import FaceCapture from '@/components/face-capture';
import { UserPlus, CheckCircle2, ArrowLeft, Fingerprint, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', employee_id: '' });
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.employee_id.trim()) { toast.error('กรุณากรอกข้อมูลให้ครบ'); return; }
    setStep(2);
  }

  async function handleSubmit() {
    if (!descriptor) { toast.error('กรุณาสแกนใบหน้าก่อน'); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('profiles').insert({ name: form.name.trim(), employee_id: form.employee_id.trim(), face_descriptor: descriptor, role: 'user', status: 'pending' });
      if (error) { toast.error(error.code === '23505' ? 'รหัสพนักงานนี้ลงทะเบียนแล้ว' : error.message); setIsSubmitting(false); return; }
      setStep(3); toast.success('ลงทะเบียนสำเร็จ!');
    } catch { toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); }
    finally { setIsSubmitting(false); }
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-container) 100%)' }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-xl hover:bg-white/50"><ArrowLeft className="w-5 h-5" style={{ color: 'var(--on-surface)' }} /></Link>
          <div><h1 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>ลงทะเบียนผู้ใช้</h1><p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>กรอกข้อมูลและสแกนใบหน้า</p></div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (<div key={s} className="flex items-center gap-2"><motion.div animate={{ background: step >= s ? 'var(--primary)' : 'var(--outline-variant)', scale: step === s ? 1.1 : 1 }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">{step > s ? <CheckCircle2 className="w-4 h-4" /> : s}</motion.div>{s < 3 && <div className="w-12 h-0.5 rounded" style={{ background: step > s ? 'var(--primary)' : 'var(--outline-variant)' }} />}</div>))}
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleFormSubmit} className="space-y-6">
              <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
                <div><label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}><User className="w-4 h-4" />ชื่อ-นามสกุล</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="กรอกชื่อ-นามสกุล" required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }} /></div>
                <div><label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}><CreditCard className="w-4 h-4" />รหัสพนักงาน</label><input type="text" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} placeholder="เช่น EMP001" required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }} /></div>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>ถัดไป — สแกนใบหน้า <Fingerprint className="w-5 h-5" /></motion.button>
            </motion.form>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}><FaceCapture onCapture={d => { setDescriptor(d); toast.success('สแกนใบหน้าสำเร็จ!'); }} onError={msg => toast.error(msg)} /></div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 px-4 py-3 rounded-xl font-medium text-sm" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }}>ย้อนกลับ</button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!descriptor || isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm disabled:opacity-50" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>{isSubmitting ? 'กำลังบันทึก...' : 'ลงทะเบียน'}<UserPlus className="w-4 h-4" /></motion.button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#e8f5e9' }}><CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success-green)' }} /></motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--on-surface)' }}>ลงทะเบียนสำเร็จ!</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--on-surface-variant)' }}>กรุณารอการอนุมัติจากผู้ดูแลระบบ</p>
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>กลับหน้าหลัก</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
