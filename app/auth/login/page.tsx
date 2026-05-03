'use client';
import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'var(--surface)'}}><p style={{color:'var(--on-surface-variant)'}}>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
