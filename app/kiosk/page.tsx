'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { loadFaceModels, detectFace } from '@/lib/face-api-loader';
import { getCurrentSession, getSessionStatuses, formatScanTime, SESSIONS } from '@/lib/session-utils';
import type { CheckInResult, Session } from '@/lib/types/database';
import { Scan, CheckCircle2, XCircle, AlertTriangle, Clock, Users, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function KioskPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionStatuses, setSessionStatuses] = useState(getSessionStatuses());
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [recentScans, setRecentScans] = useState<CheckInResult[]>([]);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const scanCooldownRef = useRef(false);

  // Clock and session update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setCurrentSession(getCurrentSession(now));
      setSessionStatuses(getSessionStatuses(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize camera and models
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadFaceModels();
        if (mounted) setModelsReady(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (mounted) setError('ไม่สามารถเริ่มกล้องหรือโหลดโมเดลได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // Auto scan loop
  const performScan = useCallback(async () => {
    if (!videoRef.current || !modelsReady || scanCooldownRef.current || scanning) return;
    if (videoRef.current.readyState !== 4) return;

    const faceResult = await detectFace(videoRef.current);
    if (!faceResult) return;

    // Face detected — process check-in
    setScanning(true);
    scanCooldownRef.current = true;

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descriptor: Array.from(faceResult.descriptor),
        }),
      });

      const data: CheckInResult = await response.json();
      setResult(data);

      if (data.type !== 'no_match') {
        setRecentScans((prev) => [data, ...prev].slice(0, 10));
      }

      // Clear result after 4 seconds
      setTimeout(() => setResult(null), 4000);

    } catch {
      setResult({
        success: false,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      });
      setTimeout(() => setResult(null), 3000);
    } finally {
      setScanning(false);
      // Cooldown to prevent rapid scans
      setTimeout(() => { scanCooldownRef.current = false; }, 3000);
    }
  }, [modelsReady, scanning]);

  // Continuous scanning loop
  useEffect(() => {
    if (!modelsReady || loading) return;

    const interval = setInterval(performScan, 1500);
    return () => clearInterval(interval);
  }, [modelsReady, loading, performScan]);

  const getResultStyles = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(46, 125, 50, 0.95)', border: '#4CAF50', icon: CheckCircle2 };
      case 'duplicate':
        return { bg: 'rgba(245, 127, 23, 0.95)', border: '#F57F17', icon: AlertTriangle };
      case 'no_match':
        return { bg: 'rgba(186, 26, 26, 0.95)', border: '#BA1A1A', icon: XCircle };
      case 'no_session':
        return { bg: 'rgba(114, 119, 131, 0.95)', border: '#727783', icon: Clock };
      default:
        return { bg: 'rgba(186, 26, 26, 0.95)', border: '#BA1A1A', icon: XCircle };
    }
  };

  return (
    <div className="h-screen flex bg-[var(--surface)]">
      {/* Main Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
            <div className="w-16 h-16 border-4 border-white/20 border-t-[var(--biometric-active)] rounded-full animate-spin" />
            <p className="text-white text-lg font-medium">กำลังเตรียมระบบสแกน...</p>
          </div>
        )}

        {/* Scanning indicator */}
        {!loading && modelsReady && !result && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Corner guides */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-[var(--biometric-active)] rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-[var(--biometric-active)] rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-[var(--biometric-active)] rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-[var(--biometric-active)] rounded-br-2xl" />
              {/* Scan line */}
              <div className="absolute left-0 right-0 h-0.5 bg-[var(--biometric-active)] opacity-60 animate-scan-line" />
            </div>

            {/* Status */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Scan className="w-5 h-5 text-[var(--biometric-active)] animate-pulse" />
                <span className="font-medium">กำลังสแกนใบหน้า...</span>
              </div>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {result && (
          <div className="absolute inset-0 z-20 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative px-8 py-6 rounded-2xl text-white text-center max-w-md mx-4 animate-success-pop"
              style={{
                background: getResultStyles(result.type).bg,
                border: `2px solid ${getResultStyles(result.type).border}`,
                backdropFilter: 'blur(16px)',
              }}
            >
              {(() => {
                const Icon = getResultStyles(result.type).icon;
                return <Icon className="w-16 h-16 mx-auto mb-3" />;
              })()}

              <h2 className="text-2xl font-bold mb-1">
                {result.user?.full_name || (result.type === 'no_session' ? 'นอกเวลาทำการ' : 'ไม่พบข้อมูล')}
              </h2>
              <p className="text-white/90 text-sm">{result.message}</p>

              {result.session && (
                <div className="mt-3 px-4 py-2 rounded-lg bg-white/10">
                  <span className="text-sm">{result.session.labelTh} | {formatScanTime(new Date().toISOString())}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #005EB8, #4285F4)' }}>
                <Scan className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">จุดลงทะเบียนเข้างาน</h1>
                <p className="text-white/70 text-xs">AI Face Scan Kiosk</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {modelsReady ? (
                <Wifi className="w-5 h-5 text-[var(--success-light)]" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <div className="text-right">
                <div className="text-white font-bold text-xl font-mono">
                  {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-white/60 text-xs">
                  {time.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — Session Info & Recent Scans */}
      <div className="w-80 border-l flex flex-col" style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-container-lowest)' }}>
        {/* Session Timeline */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--outline-variant)' }}>
          <h3 className="text-sm font-bold text-[var(--on-surface)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            รอบเวลาเข้างาน
          </h3>
          <div className="space-y-2">
            {sessionStatuses.map((s) => (
              <div
                key={s.id}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                  s.isActive ? 'session-active' : s.isPast ? 'session-past' : 'session-upcoming'
                }`}
              >
                <span>{s.labelTh}</span>
                <span className="opacity-80">{s.start} - {s.end}</span>
              </div>
            ))}
          </div>

          {!currentSession && (
            <div className="mt-2 text-center text-xs text-[var(--error)] font-medium p-2 rounded-lg" style={{ background: 'var(--error-container)' }}>
              อยู่นอกช่วงเวลาเข้างาน
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-bold text-[var(--on-surface)] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            การสแกนล่าสุด
          </h3>

          {recentScans.length === 0 ? (
            <div className="text-center py-8">
              <Scan className="w-8 h-8 mx-auto mb-2 text-[var(--outline-variant)]" />
              <p className="text-xs text-[var(--on-surface-variant)]">ยังไม่มีการสแกน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg live-feed-item"
                  style={{ background: 'var(--surface-container)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {scan.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    ) : scan.type === 'duplicate' ? (
                      <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--error)]" />
                    )}
                    <span className="text-sm font-medium text-[var(--on-surface)] truncate">
                      {scan.user?.full_name || 'ไม่ทราบชื่อ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                    <span>{scan.session?.labelTh}</span>
                    <span>{formatScanTime(new Date().toISOString())}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center" style={{ borderColor: 'var(--outline-variant)' }}>
          <Link
            href="/admin"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            เข้าสู่ระบบผู้ดูแล →
          </Link>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-4 left-4 px-4 py-3 rounded-lg bg-[var(--error)] text-white text-sm z-50">
          {error}
        </div>
      )}
    </div>
  );
}
