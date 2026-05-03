'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/client';
import { loadFaceModels, detectFace, euclideanDistance } from '@/lib/face-api-loader';
import { getCurrentSession, getSessionStatuses, formatScanTime, SESSIONS } from '@/lib/session-utils';
import { Scan, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile, Session } from '@/lib/types/database';

const MATCH_THRESHOLD = 0.6;
const SCAN_INTERVAL = 3000;

export default function KioskPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{type:'success'|'duplicate'|'error'|'no-session',user?:Profile,session?:Session,message:string}|null>(null);
  const [currentSession, setCurrentSession] = useState(getCurrentSession());
  const [recentCheckins, setRecentCheckins] = useState<{name:string,time:string,session:number}[]>([]);
  const supabase = createClient();
  const scanIntervalRef = useRef<NodeJS.Timeout|null>(null);
  const usersRef = useRef<Profile[]>([]);

  useEffect(() => {
    async function init() {
      const ok = await loadFaceModels();
      if (!ok) { toast.error('โหลดโมเดลไม่สำเร็จ'); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:{ideal:640}, height:{ideal:480} } });
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch { toast.error('ไม่สามารถเปิดกล้องได้'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('status','approved');
      usersRef.current = data || [];
      setIsReady(true);
    }
    init();
    const si = setInterval(() => setCurrentSession(getCurrentSession()), 30000);
    return () => { clearInterval(si); if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    scanIntervalRef.current = setInterval(async () => {
      if (scanning || result) return;
      await performScan();
    }, SCAN_INTERVAL);
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, [isReady, scanning, result]);

  const performScan = useCallback(async () => {
    if (!videoRef.current || scanning) return;
    const session = getCurrentSession();
    if (!session) { return; }
    setScanning(true);
    try {
      const descriptor = await detectFace(videoRef.current);
      if (!descriptor) { setScanning(false); return; }
      let bestMatch: Profile|null = null;
      let bestDist = Infinity;
      for (const user of usersRef.current) {
        if (!user.face_descriptor) continue;
        const dist = euclideanDistance(user.face_descriptor, descriptor);
        if (dist < bestDist) { bestDist = dist; bestMatch = user; }
      }
      if (!bestMatch || bestDist > MATCH_THRESHOLD) { setResult({type:'error',message:'ไม่พบข้อมูลใบหน้า กรุณาลงทะเบียนก่อน'}); setScanning(false); setTimeout(()=>setResult(null),4000); return; }
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
      const { data: existing } = await supabase.from('check_ins').select('id').eq('user_id',bestMatch.id).eq('session_number',session.id).gte('scan_time',today.toISOString()).lt('scan_time',tomorrow.toISOString());
      if (existing && existing.length > 0) { setResult({type:'duplicate',user:bestMatch,session,message:`${bestMatch.name} ลงเวลา${session.labelTh}แล้ว`}); setScanning(false); setTimeout(()=>setResult(null),4000); return; }
      const { error } = await supabase.from('check_ins').insert({ user_id:bestMatch.id, session_number:session.id, scan_time:new Date().toISOString(), status:'success' });
      if (error) { setResult({type:'error',message:'บันทึกไม่สำเร็จ'}); } else {
        setResult({type:'success',user:bestMatch,session,message:`${bestMatch.name} ลงเวลาสำเร็จ!`});
        setRecentCheckins(prev => [{name:bestMatch!.name,time:formatScanTime(new Date().toISOString()),session:session.id},...prev].slice(0,8));
        toast.success(`✓ ${bestMatch.name}`);
      }
    } catch { setResult({type:'error',message:'เกิดข้อผิดพลาด'}); }
    setScanning(false); setTimeout(()=>setResult(null),4000);
  }, [scanning, supabase]);

  const sessionStatuses = getSessionStatuses();
  const resultColors = { success:'var(--success-green)', duplicate:'#e65100', error:'var(--error-red)', 'no-session':'var(--on-surface-variant)' };

  return (
    <div className="min-h-screen flex" style={{ background:'var(--surface)' }}>
      {/* Main Camera Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2" style={{color:'var(--on-surface)'}}><Scan className="w-6 h-6" style={{color:'var(--primary)'}}/>ระบบสแกนใบหน้า</h1>
          {currentSession ? <p className="text-sm mt-1" style={{color:'var(--primary)'}}>{currentSession.labelTh} ({currentSession.start}-{currentSession.end})</p> : <p className="text-sm mt-1" style={{color:'var(--error-red)'}}>ไม่อยู่ในช่วงเวลาลงเวลา</p>}
        </div>
        <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden" style={{background:'var(--inverse-surface)'}}>
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          {!isReady && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white"/></div>}
          <div className="absolute inset-4 border-2 rounded-xl pointer-events-none" style={{borderColor: scanning?'var(--biometric-active)':result?resultColors[result.type]:'rgba(255,255,255,0.3)'}} />
          {scanning && <div className="absolute left-4 right-4 h-0.5 animate-scan-line" style={{background:'var(--biometric-active)',boxShadow:'0 0 10px var(--biometric-active)'}} />}
        </div>
        <AnimatePresence>
          {result && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="mt-6 px-6 py-4 rounded-2xl flex items-center gap-3 max-w-lg w-full" style={{background: result.type==='success'?'#e8f5e9':result.type==='duplicate'?'#fff3e0':'var(--error-container)', border:`1px solid ${resultColors[result.type]}`}}>
              {result.type==='success'?<CheckCircle2 className="w-6 h-6" style={{color:'var(--success-green)'}}/>:result.type==='duplicate'?<AlertTriangle className="w-6 h-6" style={{color:'#e65100'}}/>:<XCircle className="w-6 h-6" style={{color:'var(--error-red)'}}/>}
              <div><p className="font-semibold text-sm" style={{color:'var(--on-surface)'}}>{result.message}</p>{result.session && <p className="text-xs mt-0.5" style={{color:'var(--on-surface-variant)'}}>{result.session.labelTh}</p>}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 flex items-center gap-2 text-xs" style={{color:'var(--on-surface-variant)'}}>{isReady?<><Wifi className="w-3 h-3" style={{color:'var(--success-green)'}}/>ระบบพร้อมสแกน ({usersRef.current.length} คน)</>:<><WifiOff className="w-3 h-3"/>กำลังเชื่อมต่อ...</>}</div>
      </div>
      {/* Sidebar */}
      <div className="w-80 p-6 border-l hidden lg:flex flex-col" style={{background:'var(--surface-container-lowest)',borderColor:'var(--outline-variant)'}}>
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{color:'var(--on-surface)'}}><Clock className="w-4 h-4"/>รอบเวลาวันนี้</h2>
        <div className="space-y-2 mb-8">
          {sessionStatuses.map(({session:s,status}) => (
            <div key={s.id} className={`p-3 rounded-xl text-sm ${status==='active'?'session-active':status==='upcoming'?'session-upcoming':'session-completed'}`}>
              <div className="font-medium">{s.labelTh}</div><div className="text-xs mt-0.5 opacity-80">{s.start} - {s.end}</div>
            </div>
          ))}
        </div>
        <h2 className="font-bold text-sm mb-4" style={{color:'var(--on-surface)'}}>ลงเวลาล่าสุด</h2>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {recentCheckins.length===0?<p className="text-xs" style={{color:'var(--on-surface-variant)'}}>ยังไม่มีการลงเวลา</p>:recentCheckins.map((c,i) => (
            <motion.div key={i} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="flex items-center gap-3 p-2 rounded-lg" style={{background:'var(--surface-container)'}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}}>{c.name[0]}</div>
              <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate" style={{color:'var(--on-surface)'}}>{c.name}</p><p className="text-xs" style={{color:'var(--on-surface-variant)'}}>{c.time} • รอบ {c.session}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
