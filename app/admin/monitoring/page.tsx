'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/client';
import { getSessionById, formatScanTime } from '@/lib/session-utils';
import { Activity, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import type { CheckIn } from '@/lib/types/database';

export default function MonitoringPage() {
  const [events, setEvents] = useState<CheckIn[]>([]);
  const [connected, setConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Load recent check-ins
    async function loadRecent() {
      const today = new Date(); today.setHours(0,0,0,0);
      const {data} = await supabase.from('check_ins').select('*, profiles(name,employee_id)').gte('scan_time',today.toISOString()).order('scan_time',{ascending:false}).limit(50);
      if (data) setEvents(data);
    }
    loadRecent();
    // Subscribe to realtime
    const channel = supabase.channel('check_ins_realtime').on('postgres_changes',{event:'INSERT',schema:'public',table:'check_ins'},(payload) => {
      const newEvent = payload.new as CheckIn;
      // Fetch profile name
      supabase.from('profiles').select('name,employee_id').eq('id',newEvent.user_id).single().then(({data}) => {
        if(data) newEvent.profiles = data as any;
        setEvents(prev => [newEvent,...prev].slice(0,50));
      });
    }).subscribe((status) => { setConnected(status === 'SUBSCRIBED'); });
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>ติดตามแบบ Real-time</h1><p className="text-sm mt-1" style={{color:'var(--on-surface-variant)'}}>การลงเวลาวันนี้แบบสด</p></div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{background:connected?'#e8f5e9':'var(--error-container)',color:connected?'var(--success-green)':'var(--error-red)'}}>
          {connected?<Wifi className="w-3 h-3"/>:<WifiOff className="w-3 h-3"/>}{connected?'เชื่อมต่อแล้ว':'กำลังเชื่อมต่อ...'}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
        <div className="p-4 border-b flex items-center gap-2" style={{borderColor:'var(--outline-variant)'}}><Activity className="w-4 h-4" style={{color:'var(--primary)'}}/><span className="text-sm font-bold" style={{color:'var(--on-surface)'}}>Live Feed</span><span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}}>{events.length} รายการ</span></div>
        <div className="max-h-[600px] overflow-y-auto divide-y" style={{borderColor:'var(--outline-variant)'}}>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className="p-12 text-center text-sm" style={{color:'var(--on-surface-variant)'}}>ยังไม่มีการลงเวลาวันนี้</div>
            ) : events.map((e, i) => {
              const session = getSessionById(e.session_number);
              return (
                <motion.div key={e.id || i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="flex items-center gap-4 p-4 hover:bg-black/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{background:'var(--primary-fixed)',color:'var(--on-primary-fixed)'}}>{e.profiles?.name?.[0] || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{color:'var(--on-surface)'}}>{e.profiles?.name || 'Unknown'}</p>
                    <p className="text-xs" style={{color:'var(--on-surface-variant)'}}>{session?.labelTh || `รอบ ${e.session_number}`}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium" style={{color:'var(--on-surface)'}}>{formatScanTime(e.scan_time)}</p>
                    <div className="flex items-center gap-1 text-xs mt-0.5" style={{color:'var(--success-green)'}}><CheckCircle2 className="w-3 h-3"/>สำเร็จ</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
