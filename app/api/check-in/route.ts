import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentSession } from '@/lib/session-utils';

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; sum += d * d; }
  return Math.sqrt(sum);
}

export async function POST(request: Request) {
  try {
    const { descriptor } = await request.json();
    if (!descriptor || !Array.isArray(descriptor)) return NextResponse.json({ success:false, message:'Missing face descriptor' }, { status:400 });
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ success:false, message:'ไม่อยู่ในช่วงเวลาลงเวลา' }, { status:400 });
    const supabase = createAdminClient();
    const { data:users } = await supabase.from('profiles').select('*').eq('status','approved');
    if (!users || users.length === 0) return NextResponse.json({ success:false, message:'ไม่พบผู้ใช้ในระบบ' }, { status:404 });
    let bestMatch = null;
    let bestDist = Infinity;
    for (const user of users) {
      if (!user.face_descriptor) continue;
      const dist = euclideanDistance(user.face_descriptor, descriptor);
      if (dist < bestDist) { bestDist = dist; bestMatch = user; }
    }
    if (!bestMatch || bestDist > 0.6) return NextResponse.json({ success:false, message:'ไม่พบข้อมูลใบหน้า' }, { status:404 });
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const { data:existing } = await supabase.from('check_ins').select('id').eq('user_id',bestMatch.id).eq('session_number',session.id).gte('scan_time',today.toISOString()).lt('scan_time',tomorrow.toISOString());
    if (existing && existing.length > 0) return NextResponse.json({ success:false, message:`${bestMatch.name} ลงเวลา${session.labelTh}แล้ว`, duplicate:true });
    const { error } = await supabase.from('check_ins').insert({ user_id:bestMatch.id, session_number:session.id, scan_time:new Date().toISOString(), status:'success' });
    if (error) return NextResponse.json({ success:false, message:'บันทึกไม่สำเร็จ' }, { status:500 });
    return NextResponse.json({ success:true, message:`${bestMatch.name} ลงเวลาสำเร็จ!`, user:{ name:bestMatch.name, employee_id:bestMatch.employee_id }, session });
  } catch (err) {
    return NextResponse.json({ success:false, message:'Server error' }, { status:500 });
  }
}
