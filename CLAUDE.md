# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 web application serving as a **comprehensive placement dashboard**. Students access a public portal to view job listings, placement events, calendar, and statistics. Placement cell admins manage jobs, events, and student placements through a protected dashboard with custom JWT authentication.

**Core Features**:
- Job listings with filtering, search, workflow stages, and detailed views
- Student management with placement tracking and eligibility rules
- Placement calendar with event categorization
- Dashboard with placement statistics and analytics
- Admin panel for managing jobs, events, and student placements
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

# Admin & Data Management
pnpm create-admin <username> <password> [name]
pnpm import-ssn-jobs <csvPath>     # Import jobs from SSN format CSV
pnpm import-students <csvPath>     # Import student data
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
│  • Admin      → Manage jobs/events/      │
│               → students (3 tabs)        │
└──────────────────────────────────────────┘
```

**Route Map**:
- `/` → Redirects to `/dashboard`
- `/dashboard` → Stats cards, top recruiters, category breakdown (force-dynamic)
- `/jobs` → Filterable job listings with modal detail view showing workflow stages
- `/tracker` → Student job application tracking (placeholder)
- `/calendar` → Event calendar with category filters
- `/stats` → Detailed placement statistics (placeholder)
- `/admin` → Admin panel with Jobs/Events/Students tabs
- `/sign-in` → Admin login

### Authentication System

**Custom JWT-based authentication** (not Clerk):

- `lib/auth.ts`: Core authentication utilities (password hashing, JWT generation/verification, user management)
- HTTP-only cookies with 7-day expiration
- Middleware checks cookie existence only; JWT verification happens in route handlers (Edge Runtime limitation)
- Admin user creation via CLI script: `scripts/create-admin.ts`

**Protected routes**:
- `/admin/*` - Admin dashboard (server component checks auth, redirects to `/sign-in`)
- `/api/events` POST/PUT/DELETE - Event mutations (calls `requireAuth()`)
- `/api/jobs` POST/PUT/DELETE - Job mutations (calls `requireAuth()`)
- `/api/students` POST/PUT/DELETE - Student mutations (calls `requireAuth()`)

**Public routes**:
- `/dashboard`, `/jobs`, `/tracker`, `/calendar`, `/stats` - Student-facing pages
- `/api/events` GET, `/api/jobs` GET, `/api/stats` GET - Read-only data
- `/api/export/*` - Calendar/job exports (no auth required)

### Data Flow

```
┌──────────────────┐
│ Student Portal   │ → GET /api/jobs → Prisma → PostgreSQL (Job table)
│ (/jobs)          │ → GET /api/events → Prisma → PostgreSQL (Event table)
│                  │ → GET /api/stats → Direct Prisma queries (no API fetch)
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
                       POST/PUT/DELETE /api/students → requireAuth() → mutations
```

### Database Schema

**Core Models**:
- `User`: Admin authentication (username, hashed password, name)
- `Event`: Calendar events (title, description, startTime, endTime, category, link)
- `Job`: Job postings with full details (see schema for 30+ fields)
- `Student`: Student records with placement tracking
- `StudentPlacement`: Many-to-many relationship tracking all offers received by students
- `PlacementStat`: Cached placement statistics (year, totalOffers, avgCTC, highestCTC, topRecruiters, categoryStats)

**Job-related Models**:
- `JobWorkflowStage`: Multi-stage hiring process (Pre-Placement Talk, OA, Interview, etc.)
- `JobAttachment`: File attachments for jobs (stored as URLs)
- `JobNotice`: Important notices/updates for specific jobs
- `JobLog`: Audit trail of job changes

**Key Enums**:
- `EventCategory`: PLACEMENT, EXAM, INFO_SESSION, OA, INTERVIEW, DEADLINE, OTHER
- `JobType`: SUMMER_INTERN, REGULAR_INTERN, INTERNSHIP, FTE, INTERN_PLUS_FTE, INTERN_LEADS_TO_FTE, BOTH
- `JobCategory`: MARQUE (20L+), SUPER_DREAM (10-20L), DREAM (6-10L), CORE, REGULAR (0-3.9L), OTHER
- `JobStatus`: OPEN, IN_PROGRESS, APPLICATIONS_CLOSED, ON_HOLD, COMPLETED, CANCELLED, CLOSED
- `PlacementStatus`: OPTED_IN, OPTED_OUT, HIGHER_STUDIES, PLACED, PLACED_FINAL
- `GenderRequirement`: MALE, FEMALE, BOTH, ANY
- `ModeOfVisit`: PHYSICAL, ONLINE, HYBRID

### Student Placement Eligibility Logic

**2x CTC Rule**: If a student is placed at a CTC ≤ 6 LPA, they can sit for companies offering ≤ 2x their current CTC.

**Implementation**:
```typescript
// When student accepts an offer
const ctcValue = parseFloat(ctc.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
const canSitForMore = ctcValue <= 6
const placementStatus = canSitForMore ? 'PLACED' : 'PLACED_FINAL'

await prisma.student.update({
  where: { id: studentId },
  data: {
    placementStatus,
    canSitForMore,
    finalPlacedCompany,
    finalPlacedCTC: ctc,
    // ...
  }
})
```

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
- `app/api/jobs/[id]/route.ts` - GET (single with workflow/attachments/notices), PUT, DELETE
- `app/api/jobs/[id]/notices/route.ts` - POST/GET job notices
- `app/api/jobs/[id]/notices/[noticeId]/route.ts` - DELETE notice
- `app/api/jobs/[id]/attachments/route.ts` - POST/GET job attachments
- `app/api/jobs/[id]/attachments/[attachmentId]/route.ts` - GET/DELETE attachment
- `app/jobs/page.tsx` - Public job listings page
- `components/jobs/jobs-table.tsx` - Filterable table with search, status/type filters, workflow stage badges
- `components/jobs/job-modal.tsx` - Full job detail modal with workflow stages display
- `components/admin/enhanced-job-form.tsx` - Tabbed job form (Basic/Eligibility/Dates/POC/Workflow)
- `components/admin/jobs-list.tsx` - Admin job list with edit/delete actions

**Student Management**:
- `app/api/students/route.ts` - GET (list with filters), POST (create)
- `app/api/students/[id]/route.ts` - GET (single with placements), PUT (update)
- `app/api/students/[id]/placements/route.ts` - POST (add placement offer)
- `app/api/students/[id]/placements/[placementId]/route.ts` - PUT (update), DELETE
- `app/api/students/stats/route.ts` - GET placement statistics
- `components/admin/students-list.tsx` - Student list with filters and placement status
- `components/admin/placement-mapper.tsx` - Modal for managing student placement offers

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
- `app/dashboard/page.tsx` - Main dashboard (marked with `export const dynamic = 'force-dynamic'`)
- `app/api/stats/route.ts` - Computed placement statistics endpoint
- `components/dashboard/stats-cards.tsx` - Quick metrics cards
- `components/dashboard/top-recruiters.tsx` - Top recruiting companies list
- `components/dashboard/category-stats.tsx` - Category breakdown chart
- `components/dashboard/highest-paid.tsx` - Top 5 highest paid jobs

**Admin Panel**:
- `app/admin/page.tsx` - Tabbed admin interface (Jobs/Events/Students)

**Exports**:
- `lib/export.ts` - Generate ICS/CSV/PDF from events
- `app/api/export/ics/route.ts` - ICS export endpoint
- `app/api/export/csv/route.ts` - CSV export endpoint
- `app/api/export/pdf/route.ts` - PDF export endpoint
- `app/api/export/jobs-csv/route.ts` - Jobs CSV export
- `app/api/export/jobs-pdf/route.ts` - Jobs PDF export

**Data Import Scripts**:
- `scripts/create-admin.ts` - CLI tool to create admin users
- `scripts/import-ssn-jobs.ts` - Import jobs from SSN format CSV
- `scripts/import-students.ts` - Bulk import student data from CSV

**Utilities**:
- `lib/utils.ts` - Category colors/labels, event formatting, date utilities, status helpers
- `lib/types.ts` - TypeScript type definitions
- `lib/db.ts` - Prisma client singleton

## Important Implementation Notes

### Package Management
- Uses `pnpm` for package management
- **NEVER** manually edit `package.json` or `pnpm-lock.yaml`
- Use `pnpm add <package>` or `pnpm remove <package>` to manage dependencies

### Next.js 15 Route Handler Changes
All route handlers with dynamic params MUST use the new async params pattern:

```typescript
// CORRECT (Next.js 15)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ... rest of handler
}

// INCORRECT (will fail build)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... params.id won't work
}
```

### Edge Runtime Limitation
**Do not use JWT verification in `middleware.ts`**. The `jsonwebtoken` library requires Node.js APIs unavailable in Next.js Edge Runtime. Middleware only checks if the `auth-token` cookie exists. Actual JWT verification happens in route handlers (Node.js runtime) via `getAuthUser()` or `requireAuth()`.

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

### Dashboard Force Dynamic Rendering
The `/dashboard` page is marked with `export const dynamic = 'force-dynamic'` to prevent static pre-rendering. It directly queries the database instead of fetching from an API to avoid localhost issues during Vercel build.

### Database Updates
After modifying `prisma/schema.prisma`:
1. Run `pnpm db:generate` to update Prisma Client
2. Run `pnpm db:push` to sync with database (development)
3. Restart dev server if needed

### Adding New Job Status
1. Update `JobStatus` enum in `prisma/schema.prisma`
2. Run `pnpm db:generate && pnpm db:push`
3. Update `getJobStatusColor()` and `getJobStatusLabel()` in `lib/utils.ts`
4. Update `components/admin/enhanced-job-form.tsx` status dropdown

### Adding Workflow Stages to a Job
Workflow stages are managed in the "Workflow" tab of `enhanced-job-form.tsx`. Each stage has:
- `stageName`: Display name (e.g., "Pre Placement Talk")
- `stageType`: Machine-readable type (e.g., "PRE_PLACEMENT_TALK")
- `orderIndex`: Order in the hiring process (auto-incremented)
- `description`: Optional details about the stage

Stages are displayed in `job-modal.tsx` as numbered steps and shown as a badge ("X rounds") in `jobs-table.tsx`.

### Student Placement Workflow
1. Admin adds a placement offer via `placement-mapper.tsx`
2. Offer can be linked to an existing job or entered manually
3. When offer is marked as accepted:
   - `StudentPlacement` record updated with `isAccepted: true`
   - Student's `placementStatus` updated based on CTC
   - Student's `canSitForMore` flag set based on 2x rule
   - Student's `finalPlaced*` fields populated

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL="postgresql://..."   # PostgreSQL connection string (Neon recommended)
JWT_SECRET="..."                  # Secure random string for JWT signing
```

**Note**: README mentions Clerk variables - these are outdated. Authentication is custom JWT-based.

## Common Tasks

### Create Admin User
```bash
pnpm create-admin myusername mypassword "Display Name"
```

### Import Student Data
CSV format: name,rollNumber,email,mobile,department,batch,section,cgpa,currentArrears,historyOfArrears
```bash
pnpm import-students data/students.csv
```

### Import Jobs from SSN Format
```bash
pnpm import-ssn-jobs data/ssn-jobs.csv
```

### Add Workflow Stages to Existing Job
1. Open admin panel → Jobs tab
2. Click edit on the job
3. Navigate to "Workflow" tab
4. Click "Add Stage" and fill in details
5. Stages will appear in job modal for students

### Debug Authentication Issues
1. Check browser cookies for `auth-token` (should be HTTP-only)
2. Verify `JWT_SECRET` is set in `.env.local`
3. Check server logs for JWT verification errors
4. Ensure middleware config matches protected routes in `middleware.ts`

### Add New Public Page
1. Create page in `app/[page-name]/page.tsx`
2. Add route to `components/layout/sidebar.tsx` navItems array
3. Include appropriate icon from `lucide-react`
4. Page will automatically have sidebar navigation
