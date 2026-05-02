System Role:
Act as an expert Full-Stack Developer specializing in Next.js (App Router), Supabase (Database, Auth, Storage, Realtime), and Vercel.

Project Overview:
Build an "AI Facial Recognition Check-in System" with a robust Admin Back-office. The system includes mobile self-registration, a webcam-based check-in kiosk, and a comprehensive management dashboard for administrators.

1. Database & Security (Supabase):

Tables:

profiles: Store user info (id, name, student_id, face_descriptor [JSONB/Vector], status [pending/approved]).

check_ins: Store logs (id, user_id, session_id [1,2,3], scan_time, status).

Security: Implement Role-Based Access Control (RBAC). Only users with role: 'admin' can access the Admin Dashboard. Use Supabase RLS policies.

2. Admin Back-office System (The New Addition):
Create a Sidebar-based Admin Layout containing:

A. Dashboard Overview (The Nerve Center):

Live Stats Cards: Total Users, Present Today, Active Session Status (which session is currently open).

Visual Indicators: Real-time counter for each of the 3 sessions (e.g., Session 1: 45/50 people).

Session Status Timeline: A visual bar showing the 3 time slots (08:00-12:00, 13:00-16:00, 17:00-22:00) and highlighting the current active one.

B. Real-time Monitoring Board:

A "Live Stream" of check-in events. As soon as someone scans, their name, photo (if captured), and timestamp must pop up at the top of the list using Supabase Realtime.

C. User Management (Back-office):

User List: A table to view all registered users.

Approval System: Admin can toggle user status (Approve/Block).

Manual Check-in: Ability for admin to manually check-in a user in case of technical issues.

Search & Filter: Find users by ID or Name.

D. Check-in Reports & Logs:

A detailed log history searchable by Date and Session.

Ability to export data (CSV/Excel) for attendance records.

3. Check-in Kiosk & Logic (Review):

Webcam Interface: Real-time face scan.

Business Logic:

Validate current time against the 3 sessions.

Prevent duplicate scans in the same session.

Display UI: "Scan Successful: [User Name] @ [Time]" or "Error: Already Scanned".

4. Tech Stack Details:

UI: TailwindCSS + Shadcn/UI (for professional admin components like Tables, Charts, and Sidebars).

Icons: Lucide-react.

Charts: Tremor or Recharts (for the Dashboard Overview).

Step-by-Step Instructions:

Setup Supabase Schema with Roles and RLS.

Build the Admin Dashboard Layout with a sidebar and responsive top bar.

Implement the User Management table with CRUD and status toggles.

Develop the Live Overview board using Realtime Subscriptions.

Create the Logic for the 3-session check-in and duplicate prevention.

Ensure all Admin routes are protected via Next.js Middleware.