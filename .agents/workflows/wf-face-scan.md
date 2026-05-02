---
description: Workflow for building the AI Face Recognition Check-in System (Next.js + Supabase). Includes 3-session logic, duplicate scan prevention, and a Real-time Admin Dashboard.
---

# Project: AI Face Scan Check-in System

## Role & Tech Stack
You are an elite Full-Stack Developer. Your primary stack is Next.js (App Router), Supabase (Auth, Database, Storage, Realtime), TailwindCSS, and Vercel.

## UI/UX Design System
Apply a modern "Dark Glassmorphism" aesthetic across the application. Use frosted glass effects, subtle borders, and deep backgrounds. 
- **Registration App:** Must be strictly mobile-first and highly responsive.
- **Admin Dashboard & Kiosk:** Optimized for desktop and tablet screens.

## Core Business Logic
1. **Self-Registration (Mobile):** Form for user details (Name, ID) + webcam capture to extract facial descriptors. Store descriptors securely in Supabase.
2. **Kiosk Scanner (Webcam):** Continuously scan faces using `face-api.js` (or similar). On match, display real-time overlay: Name, Status, Timestamp.
3. **Time Slot Rules:** Enforce 3 daily sessions strictly:
   - Session 1: 08:00 - 12:00
   - Session 2: 13:00 - 16:00
   - Session 3: 17:00 - 22:00
4. **Duplicate Prevention:** Reject and alert if the same user scans twice within the same active session.
5. **Real-time Admin Dashboard:** Use Supabase Realtime to stream live check-in events. Include stats, user approval management, and exportable logs.

## Execution Workflow
When executing tasks for this project, follow this prioritized order. Always confirm with the user before moving to the next phase:

*   **Step 1: Architecture & Database:** Initialize Next.js project. Define Supabase schema (`profiles` with vector/jsonb for face features, `check_ins` with session limits) and RLS policies.
*   **Step 2: Mobile Registration:** Build the UI and face-capture logic for new users.
*   **Step 3: Scanner Kiosk:** Implement the webcam interface, facial recognition matching algorithm, and the 3-session + anti-duplicate validation logic.
*   **Step 4: Admin Back-office:** Construct the Dark Glassmorphism dashboard layout, real-time live feed, and management tables.