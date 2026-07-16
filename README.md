# Beetorial — 1-on-1 Tutoring Platform

Beetorial is an online 1-on-1 tutoring platform where children study with personal mentors over video, take proctored exams, and parents & admins track everything through a unified CRM dashboard.

## Tech Stack (Phase 0)

- **Framework:** Next.js (latest, App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database & Auth:** Supabase (PostgreSQL)
- **Testing:** Vitest (unit), Playwright (E2E)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- A Supabase account (free tier works great)

### 2. Environment Configuration
Duplicate `.env.example` to create `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (Project Settings -> API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project public anon key (Project Settings -> API)

### 3. Database Scaffolding
Apply the database schema to your Supabase PostgreSQL instance:
1. Go to your Supabase project's **SQL Editor**.
2. Create a new query.
3. Open [init.sql](supabase/migrations/20260716000000_init.sql) and paste its contents.
4. Run the query to create:
   - The user role enum: `user_role` ('student', 'parent', 'mentor', 'admin')
   - The public `profiles` table.
   - The `on_auth_user_created` trigger that maps user signups to the `profiles` table automatically.

### 4. Running Locally
Install dependencies and launch the Next.js development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Running Unit Tests (Vitest)
Unit tests test isolated logic like role checks, helpers, and validation utilities.
```bash
npm run test:unit
```

### Running End-to-End Tests (Playwright)
E2E tests verify the page loading, navigation, and proxy routing flows.
```bash
npm run test:e2e
```
*Note: Playwright will automatically start your Next.js development server in the background to execute these tests.*

---

## 📂 Phase 0 Architecture
- [proxy.ts](src/proxy.ts): Next.js request hook replacing deprecated middleware. Intercepts dashboard paths (`/student`, `/parent`, `/mentor`, `/admin`) and routes users based on their authenticated database profile role.
- [style-guide](src/app/style-guide/page.tsx): Live design showcase defining our font styling, typography scale, buttons, custom visual selection cards, and brand colors (accent color `#3C32CF`).
- [supabase](supabase/migrations/): Custom PostgreSQL triggers and schema structure mapping profiles.
