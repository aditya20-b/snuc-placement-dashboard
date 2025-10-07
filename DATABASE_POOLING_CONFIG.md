# Database Connection Pooling Configuration

## Overview

Connection pooling is critical for production performance. Prisma manages connections efficiently, but you should configure appropriate pool sizes based on your deployment environment.

## Configuration

Connection pooling is configured via the `DATABASE_URL` connection string in your `.env.local` or production environment variables.

### Recommended Production Settings

For **Vercel** or similar serverless deployments:

```env
# .env.local or Vercel Environment Variables

# For Neon/PostgreSQL with connection pooling
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true&connection_limit=10&pool_timeout=20"

# For Neon with connection pooling (recommended)
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.us-east-1.aws.neon.tech:5432/dbname?sslmode=require&connection_limit=10&pool_timeout=20"
```

### Connection Pool Parameters

| Parameter | Recommended Value | Description |
|-----------|------------------|-------------|
| `connection_limit` | 10 (serverless)<br>20 (traditional) | Max connections per Prisma Client instance |
| `pool_timeout` | 20 (seconds) | How long to wait for a connection |
| `connect_timeout` | 10 (seconds) | Connection establishment timeout |

### For Different Environments

#### Vercel/Netlify/Serverless

```env
# Lower connection limit due to many function instances
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

Rationale:
- Serverless functions create multiple instances
- Each instance has its own connection pool
- Lower limit prevents exhausting database connections
- Vercel has ~50 concurrent function limit, so 10 × 50 = 500 max connections

#### Traditional Node.js Server

```env
# Higher connection limit for single long-running process
DATABASE_URL="postgresql://...?connection_limit=20&pool_timeout=30"
```

#### Development

```env
# Lower limits for local development
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=10"
```

## Neon-Specific Configuration

If using **Neon** (recommended for this app):

1. Use the **pooled connection string** (ends with `-pooler.neon.tech`)
2. Enable connection pooling in Neon dashboard
3. Set appropriate pool mode:
   - **Transaction mode** (recommended): Best for serverless
   - **Session mode**: For traditional servers

Example:
```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.us-east-1.aws.neon.tech/dbname?sslmode=require&connection_limit=10"
```

## Monitoring Connection Usage

### Check Active Connections

```sql
-- Run in Neon SQL Editor or database console
SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_database_name';
```

### Prisma Connection Logs

Enable connection logging in development:

```typescript
// lib/db.ts (already configured in optimized version)
new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})
```

## Troubleshooting

### "Too many connections" Error

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solutions:**
1. Reduce `connection_limit` in DATABASE_URL
2. Use Neon's pooled connection endpoint
3. Enable PgBouncer on your database

### Slow Query Performance

**Symptoms:**
- Queries taking 500ms+ even with optimizations
- Timeout errors

**Solutions:**
1. Increase `pool_timeout`
2. Check database indexes (should be added via migration)
3. Monitor database CPU/memory usage
4. Consider upgrading database plan

### Connection Leaks

**Symptoms:**
- Connections not being released
- Growing connection count over time

**Solutions:**
1. Ensure all Prisma queries use proper error handling
2. Don't create multiple PrismaClient instances
3. Use the singleton pattern (already implemented in `lib/db.ts`)

## Production Checklist

Before deploying:

- [ ] Use pooled connection string (ends with `-pooler`)
- [ ] Set `connection_limit=10` for serverless
- [ ] Enable SSL/TLS (`sslmode=require`)
- [ ] Configure `pool_timeout` appropriately
- [ ] Test under load (use tools like `artillery` or `k6`)
- [ ] Monitor connection usage in production
- [ ] Set up alerts for connection exhaustion

## Current Implementation

The optimized `lib/db.ts` already implements:

✅ Singleton pattern (prevents multiple Prisma instances)
✅ Conditional query logging (dev only)
✅ Proper error handling

Next steps:
1. Update your DATABASE_URL with connection pool parameters
2. Run database migrations to add indexes
3. Deploy and monitor

## Further Reading

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Vercel + Prisma Best Practices](https://vercel.com/guides/nextjs-prisma-postgres)
