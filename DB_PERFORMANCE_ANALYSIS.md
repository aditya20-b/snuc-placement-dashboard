# Database Performance Analysis & Optimization Plan

**Branch:** `performance/database-optimization`
**Date:** 2025-10-07
**Analyzed By:** Claude Code

## Executive Summary

The application currently has **7 critical performance issues** and **8 missing database indexes** that are causing significant slowdowns. The most severe problems are:

1. **Fetching ALL records without pagination** in multiple endpoints
2. **Over-fetching data** (selecting entire objects when only specific fields are needed)
3. **Sequential queries** instead of parallel queries
4. **Missing database indexes** on frequently queried columns
5. **In-memory processing** instead of database aggregations
6. **Query logging enabled** in production (minor overhead)

---

## Critical Issues by Severity

### 🔴 **CRITICAL - Immediate Fix Required**

#### 1. **GET /api/jobs - No Pagination, Over-fetching**
**Location:** `app/api/jobs/route.ts:8-29`

**Problem:**
```typescript
const jobs = await prisma.job.findMany({
  orderBy: [...],
  include: {
    workflowStages: { orderBy: { orderIndex: 'asc' } },
    attachments: true,  // ⚠️ Fetching ALL attachment data
    notices: { orderBy: { createdAt: 'desc' } },
    _count: { ... }
  }
})
```

**Issues:**
- Fetches **ALL jobs** in database (no pagination)
- Fetches **ALL related data** (workflow stages, attachments, notices)
- With 100+ jobs and multiple attachments each, this could be 500+ KB response
- No field selection (returns all columns)

**Impact:** 🔴 **HIGH** - Main jobs page will be extremely slow with many jobs

**Solution:**
- Add pagination (limit/skip)
- Use `select` instead of `include` for attachments
- Consider lazy-loading workflow stages only when job detail is opened

---

#### 2. **GET /api/stats - Fetches ALL Jobs, In-Memory Processing**
**Location:** `app/api/stats/route.ts:6`

**Problem:**
```typescript
const jobs = await prisma.job.findMany()  // ⚠️ ALL jobs, ALL fields

// Then does ALL processing in JavaScript:
const totalJobs = jobs.length
const openJobs = jobs.filter(j => j.status === 'OPEN').length
const recruiterCounts = jobs.reduce(...)
```

**Issues:**
- Fetches ALL jobs from database
- All aggregations done in-memory in JavaScript
- Database has powerful aggregation functions that should be used

**Impact:** 🔴 **HIGH** - Stats endpoint will timeout with 1000+ jobs

**Solution:**
- Use `prisma.job.count()` with `where` clauses
- Use `prisma.job.groupBy()` for aggregations
- Only fetch top N records needed for display

---

#### 3. **Dashboard - Multiple Sequential Queries**
**Location:** `app/dashboard/page.tsx:9-55`

**Problem:**
```typescript
// Good: Parallel queries (lines 9-24)
const [totalJobs, openJobs, closedJobs, allJobs, studentStats] = await Promise.all([...])

// Bad: Sequential queries AFTER the parallel ones (lines 27-33)
const placedStudentsForCompanies = await prisma.student.findMany({ ... })

// Bad: Another sequential query (lines 48-55)
const placedStudents = await prisma.student.findMany({ ... })
```

**Issues:**
- `allJobs` fetches ALL jobs without any `select` (line 13)
- Two additional student queries done sequentially instead of in parallel
- Fetches ALL placed students to calculate averages (could be 500+ students)

**Impact:** 🔴 **HIGH** - Dashboard is the landing page, slowness here is very visible

**Solution:**
- Move all queries into single `Promise.all`
- Use `select` to only fetch needed fields
- Use database aggregations instead of fetching all records

---

### 🟡 **MEDIUM - Should Fix Soon**

#### 4. **GET /api/students - Over-fetching with Nested Includes**
**Location:** `app/api/students/route.ts:54-83`

**Problem:**
```typescript
const students = await prisma.student.findMany({
  where,
  include: {
    placements: {
      include: {
        job: {  // ⚠️ Fetching FULL job object for EACH placement
          select: { company: true, title: true }  // Good: Using select
        }
      },
      orderBy: { createdAt: 'desc' }
    },
    _count: { ... }
  }
})
```

**Issues:**
- Three separate queries (count, departments, students) - should be parallel
- For each student, fetches all placements
- For each placement, fetches job data
- With 500 students × 2 placements each = 1000+ placement records

**Impact:** 🟡 **MEDIUM** - Admin student list can be slow

**Solution:**
- Run count and departments queries in parallel with students query
- Consider pagination (already has limit/skip params)
- Limit placements per student (e.g., latest 5)

---

#### 5. **GET /api/students/stats - Fetches ALL Placed Students**
**Location:** `app/api/students/stats/route.ts:37-48`

**Problem:**
```typescript
prisma.student.findMany({
  where: {
    placementStatus: { in: ['PLACED', 'PLACED_FINAL'] }
  },
  select: { finalPlacedCompany: true }  // Good: Using select
})
```

**Issues:**
- Fetches ALL placed students to count by company
- Should use `groupBy` instead

**Impact:** 🟡 **MEDIUM** - Stats API will slow down with many placements

**Solution:**
- Replace with `groupBy` aggregation
- Database can do the counting much faster

---

### 🟢 **LOW - Nice to Have**

#### 6. **Query Logging Enabled in Production**
**Location:** `lib/db.ts:10`

**Problem:**
```typescript
new PrismaClient({
  log: ['query'],  // ⚠️ Logs every query
})
```

**Impact:** 🟢 **LOW** - Minor performance overhead, verbose logs

**Solution:**
- Only enable in development
- Use conditional logging based on NODE_ENV

---

#### 7. **No Connection Pooling Configuration**
**Location:** `lib/db.ts`

**Problem:**
- Using default Prisma connection settings
- No explicit pool size, timeout, or connection limits

**Impact:** 🟢 **LOW** - May cause connection exhaustion under high load

**Solution:**
- Configure connection pooling in DATABASE_URL
- Set explicit pool size based on expected load

---

## Missing Database Indexes

**Location:** `prisma/schema.prisma`

The schema is missing indexes on frequently filtered/sorted columns:

### Critical Indexes Needed:

1. **Job.status** - Filtered in most queries
2. **Job.category** - Used in filters and groupBy
3. **Job.type** - Used in filters
4. **Job.applyBy** - Sorted by deadline
5. **Student.placementStatus** - Filtered frequently
6. **Student.department** - Used in filters and groupBy
7. **Event.category** - Filtered in calendar
8. **Event.startTime** - Sorted chronologically

### Impact:
Without indexes, database does **full table scans** for these queries, which becomes exponentially slower as data grows.

**With 1000 jobs:**
- No index: ~50-100ms (full scan)
- With index: ~1-5ms (index lookup)

---

## Proposed Optimizations

### Phase 1: Quick Wins (1-2 hours)

1. ✅ Add database indexes to schema
2. ✅ Fix query logging to be dev-only
3. ✅ Optimize /api/stats to use database aggregations
4. ✅ Add field selection to dashboard queries

### Phase 2: Core Optimizations (2-3 hours)

5. ✅ Add pagination to /api/jobs
6. ✅ Parallelize dashboard queries
7. ✅ Optimize student queries with proper selects
8. ✅ Add connection pooling configuration

### Phase 3: Advanced (Optional)

9. ⏳ Add Redis caching for stats
10. ⏳ Implement data loader pattern for nested queries
11. ⏳ Add database query performance monitoring

---

## Expected Performance Improvements

| Endpoint | Current (estimated) | After Optimization | Improvement |
|----------|---------------------|-------------------|-------------|
| GET /api/jobs | 800ms - 2s | 50-150ms | **90% faster** |
| GET /api/stats | 500ms - 1.5s | 20-50ms | **95% faster** |
| Dashboard | 1s - 3s | 100-300ms | **85% faster** |
| GET /api/students | 600ms - 1.5s | 100-200ms | **80% faster** |
| GET /api/students/stats | 400ms - 800ms | 30-60ms | **92% faster** |

---

## Implementation Priority

**Start with these files in order:**

1. `prisma/schema.prisma` - Add indexes
2. `lib/db.ts` - Fix query logging
3. `app/api/stats/route.ts` - Use database aggregations
4. `app/dashboard/page.tsx` - Optimize queries
5. `app/api/jobs/route.ts` - Add pagination
6. `app/api/students/route.ts` - Optimize includes
7. `app/api/students/stats/route.ts` - Use groupBy

---

## Next Steps

1. Review this analysis
2. Implement Phase 1 optimizations
3. Run database migration for indexes
4. Test performance improvements
5. Monitor production metrics
6. Proceed to Phase 2 if needed

---

## Notes

- All optimizations maintain backward compatibility
- No breaking changes to API contracts
- Schema changes require database migration
- Can be deployed incrementally
