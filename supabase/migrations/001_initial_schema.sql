-- ============================================================
-- AI Face Scan Check-in System — Initial Schema
-- ============================================================

-- Profiles table: stores user information and face descriptors
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  face_descriptor JSONB,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Check-ins table: stores all scan logs
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL CHECK (session_number IN (1, 2, 3)),
  scan_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'duplicate', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index: prevent duplicate successful check-ins per user per session per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_checkin_per_session
  ON public.check_ins (user_id, session_number, (scan_time::date))
  WHERE status = 'success';

-- Index for fast lookups by date
CREATE INDEX IF NOT EXISTS idx_checkins_scan_date
  ON public.check_ins ((scan_time::date));

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_checkins_user_id
  ON public.check_ins (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles: anon can insert (for registration without auth)
CREATE POLICY "Anyone can register a profile"
  ON public.profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Profiles: approved profiles are readable by anyone (needed for kiosk face matching)
CREATE POLICY "Approved profiles are public readable"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Profiles: admins have full access
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
  );

-- Check-ins: anyone can insert (kiosk runs without user auth)
CREATE POLICY "Anyone can create check_ins"
  ON public.check_ins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Check-ins: readable by authenticated users (for admin dashboard)
CREATE POLICY "Authenticated can read check_ins"
  ON public.check_ins FOR SELECT
  TO authenticated
  USING (true);

-- Check-ins: anon can read today's check-ins (for kiosk duplicate check)
CREATE POLICY "Anon can read todays check_ins"
  ON public.check_ins FOR SELECT
  TO anon
  USING (scan_time::date = CURRENT_DATE);

-- ============================================================
-- Realtime
-- ============================================================

-- Enable realtime for check_ins so dashboard receives live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;

-- ============================================================
-- Updated at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
