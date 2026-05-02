import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentSession } from '@/lib/session-utils';
import type { CheckInResult, Profile } from '@/lib/types/database';

/**
 * Euclidean distance between two face descriptors.
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

const MATCH_THRESHOLD = 0.6;

export async function POST(request: NextRequest): Promise<NextResponse<CheckInResult>> {
  try {
    const body = await request.json();
    const { descriptor } = body as { descriptor: number[] };

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({
        success: false,
        type: 'error',
        message: 'Invalid face descriptor',
      }, { status: 400 });
    }

    // 1. Check current session
    const currentSession = getCurrentSession();
    if (!currentSession) {
      return NextResponse.json({
        success: false,
        type: 'no_session',
        message: 'ไม่อยู่ในช่วงเวลาเข้างาน',
        session: undefined,
      });
    }

    // 2. Fetch all approved profiles with face descriptors
    const supabase = createAdminClient();

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'approved')
      .not('face_descriptor', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({
        success: false,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล',
      }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        type: 'no_match',
        message: 'ไม่พบผู้ใช้ที่ลงทะเบียนในระบบ',
      });
    }

    // 3. Find best match
    let bestMatch: Profile | null = null;
    let bestDistance = Infinity;

    for (const profile of profiles) {
      const storedDescriptor = profile.face_descriptor as number[];
      if (!storedDescriptor || storedDescriptor.length !== 128) continue;

      const distance = euclideanDistance(descriptor, storedDescriptor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = profile as Profile;
      }
    }

    if (!bestMatch || bestDistance > MATCH_THRESHOLD) {
      return NextResponse.json({
        success: false,
        type: 'no_match',
        message: 'ไม่พบใบหน้าในระบบ กรุณาลงทะเบียนก่อน',
      });
    }

    // 4. Check for duplicate scan today in this session
    const today = new Date().toISOString().split('T')[0];

    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', bestMatch.id)
      .eq('session_number', currentSession.id)
      .eq('status', 'success')
      .gte('scan_time', `${today}T00:00:00`)
      .lte('scan_time', `${today}T23:59:59`)
      .maybeSingle();

    if (existingCheckIn) {
      // Record the duplicate attempt
      await supabase.from('check_ins').insert({
        user_id: bestMatch.id,
        session_number: currentSession.id,
        status: 'duplicate',
      });

      return NextResponse.json({
        success: false,
        type: 'duplicate',
        message: `${bestMatch.full_name} ได้ลงเวลาในรอบนี้แล้ว`,
        user: bestMatch,
        session: currentSession,
      });
    }

    // 5. Insert successful check-in
    const { error: insertError } = await supabase.from('check_ins').insert({
      user_id: bestMatch.id,
      session_number: currentSession.id,
      status: 'success',
    });

    if (insertError) {
      // Handle unique constraint violation (race condition)
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: false,
          type: 'duplicate',
          message: `${bestMatch.full_name} ได้ลงเวลาในรอบนี้แล้ว`,
          user: bestMatch,
          session: currentSession,
        });
      }

      console.error('Error inserting check-in:', insertError);
      return NextResponse.json({
        success: false,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการบันทึก',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      type: 'success',
      message: `สแกนสำเร็จ — ${bestMatch.full_name}`,
      user: bestMatch,
      session: currentSession,
    });

  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json({
      success: false,
      type: 'error',
      message: 'เกิดข้อผิดพลาดภายในระบบ',
    }, { status: 500 });
  }
}
