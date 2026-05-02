'use client';

import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const unauthorizedError = searchParams.get('error') === 'unauthorized';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f9f9ff 0%, #d6e3ff 50%, #c9e3fa 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Admin Dashboard — AI Face Scan System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 animate-slide-in-up">
          {unauthorizedError && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--on-surface)] mb-1.5">
                อีเมล
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[var(--on-surface)] mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent pr-12"
                  style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--on-surface-variant)] mt-6">
          © 2026 AI Face Scan Check-in System
        </p>
      </div>
    </div>
  );
}
