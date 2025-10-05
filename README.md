# Placement Calendar

A web-based calendar application for managing placement events, exams, and information sessions. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### For Students (Public View)
- **Calendar Views**: Monthly, weekly, and daily calendar views
- **Event Categories**: Color-coded events (Placement, Exam, Info Session, Other)
- **Category Filtering**: Filter events by category
- **Event Details**: Click events to view full details including description and links
- **Export Options**: Download calendar as ICS, CSV, or PDF

### For Placement Cell (Admin)
- **Secure Login**: Authentication via Clerk
- **Event Management**: Create, edit, and delete events
- **Event Details**: Add title, description, date/time, category, and external links
- **Admin Dashboard**: Clean interface for managing all events

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Calendar**: FullCalendar.js
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Vercel-ready

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd placement-calendar
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Set up the following variables:

#### Database (Supabase recommended)
- `DATABASE_URL`: PostgreSQL connection string

#### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio
pnpm db:studio
```

### 4. Development

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

### Vercel (Recommended)

1. **Create a Vercel project** and connect your repository
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy

### Environment Variables for Production

Ensure these are set in your deployment platform:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin"`

## Usage

### Admin Access
1. Navigate to `/admin` or click the "Admin" button
2. Sign in with Clerk authentication
3. Create, edit, and manage events

### Student Access
1. Visit the home page to view the calendar
2. Use category filters to show/hide event types
3. Click events for details
4. Export calendar in various formats

## Project Structure

```
placement-calendar/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── calendar/          # Calendar components
│   └── ui/                # Shared UI components
├── lib/                   # Utility functions
│   ├── db.ts              # Database client
│   ├── export.ts          # Export utilities
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema
└── middleware.ts          # Route protection
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.