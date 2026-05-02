'use client';

import { useState } from 'react';
import { createClient } from '@/lib/client';
import FaceCapture from '@/components/face-capture';
import { UserPlus, CheckCircle2, ArrowLeft, Fingerprint, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

type Step = 'form' | 'capture' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim()) return;
    setStep('capture');
  };

  const handleFaceCapture = (descriptor: number[], imageDataUrl: string) => {
    setFaceDescriptor(descriptor);
    setAvatarUrl(imageDataUrl);
  };

  const handleRegister = async () => {
    if (!faceDescriptor || !fullName || !studentId) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase.from('profiles').insert({
        full_name: fullName.trim(),
        student_id: studentId.trim(),
        face_descriptor: faceDescriptor,
        avatar_url: avatarUrl,
        status: 'pending',
        role: 'user',
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('รหัสนี้ถูกลงทะเบียนแล้ว กรุณาใช้รหัสอื่น');
        } else {
          setError(insertError.message);
        }
        return;
      }

      setStep('success');
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f9f9ff 0%, #d6e3ff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--on-surface)]" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[var(--on-surface)]">ลงทะเบียนผู้ใช้</h1>
            <p className="text-xs text-[var(--on-surface-variant)]">Self Registration</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {[
            { id: 'form', label: 'ข้อมูล', icon: User },
            { id: 'capture', label: 'ใบหน้า', icon: Fingerprint },
            { id: 'success', label: 'สำเร็จ', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.id
                    ? 'bg-[var(--primary)] text-white'
                    : (i < ['form', 'capture', 'success'].indexOf(step))
                    ? 'bg-[var(--success)] text-white'
                    : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              {i < 2 && (
                <div
                  className="w-8 h-0.5 mx-1"
                  style={{
                    background: i < ['form', 'capture', 'success'].indexOf(step)
                      ? 'var(--success)' : 'var(--outline-variant)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <div className="glass-card p-6 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-fixed)' }}>
                <UserPlus className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--on-surface)]">กรอกข้อมูลส่วนตัว</h2>
                <p className="text-xs text-[var(--on-surface-variant)]">กรุณากรอกชื่อและรหัสของคุณ</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-[var(--on-surface)] mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5" />
                  ชื่อ-นามสกุล
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
                />
              </div>

              <div>
                <label htmlFor="reg-id" className="block text-sm font-medium text-[var(--on-surface)] mb-1.5">
                  <CreditCard className="w-4 h-4 inline mr-1.5" />
                  รหัสพนักงาน / รหัสนักศึกษา
                </label>
                <input
                  id="reg-id"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น EMP-0001"
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg mt-6"
                style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
              >
                ถัดไป — บันทึกใบหน้า
                <Fingerprint className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Face Capture */}
        {step === 'capture' && (
          <div className="glass-card p-6 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4285F4, #005EB8)' }}>
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--on-surface)]">บันทึกใบหน้า</h2>
                <p className="text-xs text-[var(--on-surface-variant)]">มองตรงกล้องและให้ใบหน้าอยู่ในกรอบ</p>
              </div>
            </div>

            <FaceCapture onCapture={handleFaceCapture} disabled={loading} />

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3 px-4 rounded-xl font-medium border transition-all hover:bg-[var(--surface-container)]"
                style={{ borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleRegister}
                disabled={!faceDescriptor || loading}
                className="flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: faceDescriptor ? 'linear-gradient(135deg, #2E7D32, #4CAF50)' : 'var(--outline)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ยืนยันลงทะเบียน
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="glass-card p-8 text-center animate-success-pop">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E7D32, #4CAF50)' }}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-xl font-bold text-[var(--on-surface)] mb-2">ลงทะเบียนสำเร็จ!</h2>
            <p className="text-sm text-[var(--on-surface-variant)] mb-1">
              ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว
            </p>
            <p className="text-xs text-[var(--on-surface-variant)] mb-6">
              กรุณารอการอนุมัติจากผู้ดูแลระบบก่อนใช้งานระบบสแกนใบหน้า
            </p>

            <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--surface-container)' }}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--on-surface-variant)]">ชื่อ</span>
                <span className="font-medium text-[var(--on-surface)]">{fullName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--on-surface-variant)]">รหัส</span>
                <span className="font-medium text-[var(--on-surface)]">{studentId}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 py-3 px-4 rounded-xl font-medium border text-center transition-all hover:bg-[var(--surface-container)]"
                style={{ borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}
              >
                กลับหน้าหลัก
              </Link>
              <button
                onClick={() => {
                  setStep('form');
                  setFullName('');
                  setStudentId('');
                  setFaceDescriptor(null);
                  setAvatarUrl(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
              >
                ลงทะเบียนคนใหม่
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
