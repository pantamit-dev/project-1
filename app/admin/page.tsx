'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/client';
import { getCurrentSession, getSessionStatuses, getTodayRange, SESSIONS } from '@/lib/session-utils';
import { Users, CheckCircle2, Clock, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const fadeIn = { initial:{opacity:0,y:20}, animate:{opacity:1,y:0} };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers:0, approved:0, pending:0, blocked:0, todayCheckins:0, sessionCounts:[0,0,0] });
  const [weeklyData, setWeeklyData] = useState<number[]>([0,0,0,0,0,0,0]);
  const supabase = createClient();
  const currentSession = getCurrentSession();
  const sessionStatuses = getSessionStatuses();

  useEffect(() => {
    async function load() {
      const {count:total} = await supabase.from('profiles').select('*',{count:'exact',head:true});
      const {count:approved} = await supabase.from('profiles').select('*',{count:'exact',head:true}).eq('status','approved');
      const {count:pending} = await supabase.from('profiles').select('*',{count:'exact',head:true}).eq('status','pending');
      const {count:blocked} = await supabase.from('profiles').select('*',{count:'exact',head:true}).eq('status','blocked');
      const {start,end} = getTodayRange();
      const {count:todayCheckins} = await supabase.from('check_ins').select('*',{count:'exact',head:true}).gte('scan_time',start).lt('scan_time',end);
      const sc = [0,0,0];
      for (let i=1;i<=3;i++){
        const {count} = await supabase.from('check_ins').select('*',{count:'exact',head:true}).eq('session_number',i).gte('scan_time',start).lt('scan_time',end);
        sc[i-1] = count||0;
      }
      setStats({totalUsers:total||0,approved:approved||0,pending:pending||0,blocked:blocked||0,todayCheckins:todayCheckins||0,sessionCounts:sc});
      // Weekly
      const days:number[] = [];
      for(let d=6;d>=0;d--){
        const day = new Date(); day.setDate(day.getDate()-d); day.setHours(0,0,0,0);
        const next = new Date(day); next.setDate(next.getDate()+1);
        const {count:c} = await supabase.from('check_ins').select('*',{count:'exact',head:true}).gte('scan_time',day.toISOString()).lt('scan_time',next.toISOString());
        days.push(c||0);
      }
      setWeeklyData(days);
    }
    load();
  }, []);

  const dayLabels = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toLocaleDateString('th-TH',{weekday:'short'});});

  const statCards = [
    {label:'ผู้ใช้ทั้งหมด',value:stats.totalUsers,icon:Users,color:'var(--primary)',bg:'var(--primary-fixed)'},
    {label:'อนุมัติแล้ว',value:stats.approved,icon:UserCheck,color:'var(--success-green)',bg:'#e8f5e9'},
    {label:'รอดำเนินการ',value:stats.pending,icon:Clock,color:'#e65100',bg:'#fff3e0'},
    {label:'ลงเวลาวันนี้',value:stats.todayCheckins,icon:CheckCircle2,color:'var(--primary)',bg:'var(--primary-fixed)'},
  ];

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>ภาพรวมแดชบอร์ด</h1><p className="text-sm mt-1" style={{color:'var(--on-surface-variant)'}}>สรุปข้อมูลระบบ Face Scan Check-in</p></div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card,i) => (
          <motion.div key={i} {...fadeIn} transition={{delay:i*0.1}} className="p-5 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:card.bg}}><card.icon className="w-5 h-5" style={{color:card.color}}/></div>
              <TrendingUp className="w-4 h-4" style={{color:'var(--on-surface-variant)'}}/>
            </div>
            <p className="text-2xl font-bold" style={{color:'var(--on-surface)'}}>{card.value}</p>
            <p className="text-xs mt-1" style={{color:'var(--on-surface-variant)'}}>{card.label}</p>
          </motion.div>
        ))}
      </div>
      {/* Session Status */}
      <motion.div {...fadeIn} transition={{delay:0.4}} className="p-6 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{color:'var(--on-surface)'}}><Clock className="w-4 h-4"/>สถานะรอบเวลา</h2>
        <div className="grid grid-cols-3 gap-3">
          {sessionStatuses.map(({session:s,status},i) => (
            <div key={s.id} className={`p-4 rounded-xl text-center ${status==='active'?'session-active':status==='upcoming'?'session-upcoming':'session-completed'}`}>
              <p className="font-bold text-lg">{stats.sessionCounts[i]}</p>
              <p className="text-xs mt-1">{s.labelTh}</p>
              <p className="text-xs opacity-70">{s.start}-{s.end}</p>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{delay:0.5}} className="p-6 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
          <h2 className="font-bold text-sm mb-4" style={{color:'var(--on-surface)'}}>การลงเวลา 7 วันล่าสุด</h2>
          <Bar data={{labels:dayLabels,datasets:[{label:'จำนวนครั้ง',data:weeklyData,backgroundColor:'rgba(0,94,184,0.7)',borderRadius:8}]}} options={{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}}/>
        </motion.div>
        <motion.div {...fadeIn} transition={{delay:0.6}} className="p-6 rounded-2xl" style={{background:'var(--surface-container-lowest)',border:'1px solid var(--outline-variant)'}}>
          <h2 className="font-bold text-sm mb-4" style={{color:'var(--on-surface)'}}>สถานะผู้ใช้</h2>
          <div className="max-w-[250px] mx-auto">
            <Doughnut data={{labels:['อนุมัติ','รอดำเนินการ','ระงับ'],datasets:[{data:[stats.approved,stats.pending,stats.blocked],backgroundColor:['#2E7D32','#e65100','#B00020'],borderWidth:0}]}} options={{cutout:'65%',plugins:{legend:{position:'bottom'}}}}/>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
