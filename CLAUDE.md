# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 web application serving as a **comprehensive placement dashboard**. Students access a public portal to view job listings, placement events, calendar, and statistics. Placement cell admins manage jobs and events through a protected dashboard with custom JWT authentication.

**Core Features**:
- Job listings with filtering, search, and detailed views
- Placement calendar with event categorization
- Dashboard with placement statistics and analytics
- Admin panel for managing jobs and events
- Export functionality (ICS, CSV, PDF)

## Development Commands

```bash
# Development
pnpm dev                    # Start development server (default: localhost:3000)

# Database
pnpm db:generate           # Generate Prisma client after schema changes
pnpm db:push               # Push schema to database (development)
pnpm db:studio             # Open Prisma Studio GUI

# Build & Deploy
pnpm build                 # Production build
pnpm start                 # Start production server
pnpm lint                  # Run ESLint

# Admin User Management
pnpm create-admin <username> <password> [name]
```

## Architecture

### Application Structure

The application follows a **hub-and-spoke** navigation pattern with a persistent sidebar:

```
┌──────────────────────────────────────────┐
│  Sidebar (Desktop) / Hamburger (Mobile)  │
├──────────────────────────────────────────┤
│  • Dashboard  → Stats overview           │
│  • Jobs       → Job listings table       │
│  • Tracker    → Personal tracking        │
│  • Calendar   → Event timeline           │
│  • Stats      → Detailed analytics       │
│  • Admin      → Event/job management     │
└──────────────────────────────────────────┘
```

**Route Map**:
- `/` → Redirects to `/dashboard`
- `/dashboard` → Stats cards, top recruiters, category breakdown
- `/jobs` → Filterable job listings with modal detail view
- `/tracker` → Student job application tracking (placeholder)
- `/calendar` → Event calendar with category filters
- `/stats` → Detailed placement statistics (placeholder)
- `/admin` → Admin panel with Events/Jobs tabs
- `/sign-in` → Admin login

### Authentication System

**Custom JWT-based authentication** (not Clerk - README is outdated):

- `lib/auth.ts`: Core authentication utilities (password hashing, JWT generation/verification, user management)
- HTTP-only cookies with 7-day expiration
- Middleware checks cookie existence only; JWT verification happens in route handlers (Edge Runtime limitation)
- Admin user creation via CLI script: `scripts/create-admin.ts`

**Protected routes**:
- `/admin/*` - Admin dashboard (server component checks auth, redirects to `/sign-in`)
- `/api/events` POST/PUT/DELETE - Event mutations (calls `requireAuth()`)
- `/api/jobs` POST/PUT/DELETE - Job mutations (calls `requireAuth()`)

**Public routes**:
- `/dashboard`, `/jobs`, `/tracker`, `/calendar`, `/stats` - Student-facing pages
- `/api/events` GET, `/api/jobs` GET, `/api/stats` GET - Read-only data
- `/api/export/*` - Calendar/job exports (no auth required)

### Data Flow

```
┌──────────────────┐
│ Student Portal   │ → GET /api/jobs → Prisma → PostgreSQL (Job table)
│ (/jobs)          │ → GET /api/events → Prisma → PostgreSQL (Event table)
│                  │ → GET /api/stats → Computed stats from jobs
└──────────────────┘

┌──────────────────┐
│  Admin Login     │ → POST /api/auth/login → lib/auth.authenticateUser()
│  (/sign-in)      │   ← Set HTTP-only cookie      ↓
└──────────────────┘                         PostgreSQL (User table)

┌──────────────────┐
│ Admin Dashboard  │ → middleware.ts (check cookie exists)
│  (/admin)        │   ↓
└──────────────────┘   Server Component: getAuthUser() → verify JWT
                       ↓
                       POST/PUT/DELETE /api/jobs → requireAuth() → mutations
                       POST/PUT/DELETE /api/events → requireAuth() → mutations
```

### Database Schema

**Models**:
- `User`: Admin authentication (username, hashed password, name)
- `Event`: Calendar events (title, description, startTime, endTime, category, link)
- `Job`: Job postings (company, title, ctc, stipend, type, category, status, applyBy, eligibility, location, link, description)
- `PlacementStat`: Cached placement statistics (year, totalOffers, avgCTC, highestCTC, topRecruiters, categoryStats)

**Enums**:
- `EventCategory`: PLACEMENT, EXAM, INFO_SESSION, OA, INTERVIEW, DEADLINE, OTHER
- `JobType`: INTERNSHIP, FTE, BOTH
- `JobCategory`: DREAM, SUPER_DREAM, CORE, OTHER
- `JobStatus`: OPEN, IN_PROGRESS, CLOSED

### Key Files

**Layout & Navigation**:
- `app/layout.tsx` - Root layout with sidebar and main content area
- `components/layout/sidebar.tsx` - Persistent navigation (desktop: fixed, mobile: hamburger)

**Authentication**:
- `lib/auth.ts` - All auth logic (hash/verify passwords, generate/verify JWT, manage cookies, user CRUD)
- `middleware.ts` - Route protection (cookie check only, not JWT verification)
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- `app/(auth)/sign-in/page.tsx` - Login form
- `app/admin/layout.tsx` - Admin layout with auth check and logout button

**Job Management**:
- `app/api/jobs/route.ts` - GET (public list), POST (protected create)
- `app/api/jobs/[id]/route.ts` - GET (single), PUT (update), DELETE (delete)
- `app/jobs/page.tsx` - Public job listings page
- `components/jobs/jobs-table.tsx` - Filterable table with search, status/type filters
- `components/jobs/job-modal.tsx` - Full job detail modal
- `components/admin/job-form.tsx` - Create/edit job form
- `components/admin/jobs-list.tsx` - Admin job list with edit/delete actions

**Event Management**:
- `app/api/events/route.ts` - GET (public), POST (protected)
- `app/api/events/[id]/route.ts` - PUT, DELETE (protected)
- `app/calendar/page.tsx` - Public calendar page
- `components/calendar/calendar-view.tsx` - FullCalendar wrapper (monthly/weekly/daily views)
- `components/calendar/category-filter.tsx` - Category checkboxes with color indicators
- `components/calendar/event-modal.tsx` - Event detail popup
- `components/calendar/export-dropdown.tsx` - ICS/CSV/PDF export buttons
- `components/admin/event-form.tsx` - Create/edit event form
- `components/admin/events-list.tsx` - Admin event list with edit/delete

**Dashboard & Analytics**:
- `app/dashboard/page.tsx` - Main dashboard with stats overview
- `app/api/stats/route.ts` - Computed placement statistics endpoint
- `components/dashboard/stats-cards.tsx` - Quick metrics cards
- `components/dashboard/top-recruiters.tsx` - Top recruiting companies list

**Admin Panel**:
- `app/admin/page.tsx` - Tabbed admin interface (Events tab + Jobs tab)

**Exports**:
- `lib/export.ts` - Generate ICS/CSV/PDF from events
- `app/api/export/ics/route.ts` - ICS export endpoint
- `app/api/export/csv/route.ts` - CSV export endpoint
- `app/api/export/pdf/route.ts` - PDF export endpoint

**Utilities**:
- `lib/utils.ts` - Category colors/labels, event formatting, date utilities
- `lib/types.ts` - TypeScript type definitions

## Important Implementation Notes

### Package Management and Tooling
- Uses `pnpm` for package management. Use `pnpm install` to install dependencies
- Do NOT manually edit `package.json` or `pnpm-lock.yaml`. Use `pnpm add <package>` or `pnpm remove <package>` to manage dependencies

### Edge Runtime Limitation
**Do not use JWT verification in `middleware.ts`**. The `jsonwebtoken` library requires Node.js APIs (e.g., `process.version`) unavailable in Next.js Edge Runtime. Middleware only checks if the `auth-token` cookie exists. Actual JWT verification happens in route handlers (Node.js runtime) via `getAuthUser()` or `requireAuth()`.

### Authentication Pattern
```typescript
// In middleware.ts (Edge Runtime)
const token = request.cookies.get('auth-token')
if (!token || !token.value) {
  // Redirect or 401
}

// In route handlers (Node.js Runtime)
import { requireAuth } from '@/lib/auth'
export async function POST(request: NextRequest) {
  const user = await requireAuth() // JWT verified here
  // ... rest of handler
}
```

### Database Updates
After modifying `prisma/schema.prisma`:
1. Run `pnpm db:generate` to update Prisma Client
2. Run `pnpm db:push` to sync with database (development)
3. Import updated types: `import { prisma } from '@/lib/db'`

### Adding New Event Categories
1. Update `EventCategory` enum in `prisma/schema.prisma`
2. Run `pnpm db:generate && pnpm db:push`
3. Update `getCategoryColor()` and `getCategoryLabel()` in `lib/utils.ts`
4. Colors will automatically appear in `components/calendar/category-filter.tsx`

### Adding New Job Fields
1. Update `Job` model in `prisma/schema.prisma`
2. Run `pnpm db:generate && pnpm db:push`
3. Update `components/admin/job-form.tsx` to include new field in form
4. Update `components/jobs/jobs-table.tsx` if field should be displayed in table
5. Update `components/jobs/job-modal.tsx` if field should be shown in detail view
6. Update API validation in `app/api/jobs/route.ts` and `app/api/jobs/[id]/route.ts`

### Sidebar Navigation
- Sidebar visibility controlled by `components/layout/sidebar.tsx`
- Automatically hidden on `/sign-in` route
- Desktop: Fixed sidebar (lg:flex), main content has `lg:pl-64` padding
- Mobile: Hamburger menu with slide-out drawer
- Active route highlighting based on `usePathname()` hook

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL="postgresql://..."   # PostgreSQL connection string (Neon recommended)
JWT_SECRET="..."                  # Secure random string for JWT signing
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Optional: for SSR fetch calls
```

**Note**: README mentions Clerk variables - ignore these. Authentication is custom JWT-based.

## Common Tasks

### Create Admin User
```bash
pnpm create-admin myusername mypassword "Display Name"
```

### Modify Authentication Logic
All auth utilities centralized in `lib/auth.ts`. Common functions:
- `createUser()` - Create admin user
- `authenticateUser()` - Verify credentials
- `requireAuth()` - Protect API routes
- `getAuthUser()` - Get current user in server components
- `setAuthCookie()` / `removeAuthCookie()` - Manage session

### Debug Authentication Issues
1. Check browser cookies for `auth-token` (should be HTTP-only)
2. Verify `JWT_SECRET` is set in `.env.local`
3. Check server logs for JWT verification errors
4. Ensure middleware config matches protected routes:
   ```typescript
   export const config = {
     matcher: ['/admin/:path*', '/api/events/:path*', '/api/jobs/:path*']
   }
   ```

### Add New Dashboard Widget
1. Create component in `components/dashboard/`
2. Fetch data from `/api/stats` or create new endpoint
3. Import and use in `app/dashboard/page.tsx`
4. Ensure server-side data fetching uses `cache: 'no-store'` for fresh data

### Add New Public Page
1. Create page in `app/[page-name]/page.tsx`
2. Add route to `components/layout/sidebar.tsx` navItems array
3. Include appropriate icon from `lucide-react`
4. Page will automatically have sidebar navigation
