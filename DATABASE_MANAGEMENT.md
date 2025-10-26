# Database Management Guide

## Overview

Your Instagram clone uses **PostgreSQL** with **Prisma ORM**. Here's how to manage it effectively.

## 🎯 Best Practices

### 1. Use Prisma Studio (Recommended for Development)

**Prisma Studio** is a visual database browser - the easiest way to manage your data.

```bash
cd backend
npm run prisma:studio
```

Opens at **http://localhost:5555**

**What you can do:**
- ✅ View all tables and data
- ✅ Add/edit/delete records
- ✅ Browse relationships (posts → user, comments → post)
- ✅ Filter and search data
- ✅ Export data
- ✅ Quick debugging

**Best for:**
- Development and testing
- Inspecting data
- Quick fixes
- Understanding relationships

---

## 🗄️ Database Environments

### Development Database (Your Mac)

```env
DATABASE_URL="postgresql://iguser:newpassword@localhost:5432/instagram_clone?schema=public"
```

**Management strategy:**
- Use Prisma Studio daily
- Re-seed often for testing: `npm run prisma:seed`
- Don't worry about data loss
- Experiment freely

### Production Database (Future)

```env
DATABASE_URL="postgresql://user:pass@production-host:5432/instagram_prod?schema=public"
```

**Management strategy:**
- Regular backups (see below)
- Migration scripts only
- Never seed in production
- Monitor performance
- Use connection pooling

---

## 🔄 Migration Workflow

### Creating Schema Changes

**1. Modify Prisma Schema**
```bash
# Edit backend/prisma/schema.prisma
# Add/modify models
```

**2. Generate Migration**
```bash
cd backend
npm run prisma:migrate

# Or with custom name:
npx prisma migrate dev --name add_stories_feature
```

**3. What Happens:**
- Creates SQL migration file in `prisma/migrations/`
- Updates database schema
- Regenerates Prisma Client
- Safe and version-controlled

### Migration Best Practices

✅ **DO:**
- Name migrations descriptively: `add_stories_table`, `add_user_verified_field`
- Review generated SQL before applying
- Commit migrations to git
- Test migrations on dev database first
- Use `prisma migrate deploy` in production (not `migrate dev`)

❌ **DON'T:**
- Edit migration files manually (unless you know what you're doing)
- Delete migration history
- Mix `prisma db push` and `migrate dev`
- Run migrations in production without testing

### Migration Commands

```bash
# Development: create and apply migration
npm run prisma:migrate

# See migration status
npx prisma migrate status

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Generate Prisma Client only (no database changes)
npm run prisma:generate
```

---

## 💾 Backup & Restore

### Backup Your Database

**Full Backup:**
```bash
# Backup entire database
pg_dump -U iguser -h localhost instagram_clone > backup_$(date +%Y%m%d_%H%M%S).sql

# With compression
pg_dump -U iguser -h localhost instagram_clone | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Backup Script (create `backend/scripts/backup.sh`):**
```bash
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U iguser -h localhost instagram_clone > "$BACKUP_DIR/instagram_$DATE.sql"
echo "Backup created: $BACKUP_DIR/instagram_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "instagram_*.sql" -mtime +7 -delete
```

**Make executable and run:**
```bash
chmod +x backend/scripts/backup.sh
./backend/scripts/backup.sh
```

### Restore from Backup

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS instagram_clone;"
psql -U postgres -c "CREATE DATABASE instagram_clone OWNER iguser;"

# Restore from backup
psql -U iguser -h localhost instagram_clone < backup_20250126_120000.sql

# Regenerate Prisma Client
cd backend
npm run prisma:generate
```

---

## 🌱 Data Seeding Strategies

### Development Seeding

**Quick Reset & Seed:**
```bash
cd backend

# Option 1: Reset everything and re-seed
npx prisma migrate reset
# This automatically runs the seed script

# Option 2: Just re-seed (keeps schema)
npx prisma db seed
# or
npm run prisma:seed
```

### Custom Seed Scripts

Create different seed files for different scenarios:

**backend/prisma/seed.minimal.ts** - Just a few users
```typescript
// Quick minimal data for testing
```

**backend/prisma/seed.full.ts** - Full realistic data
```typescript
// Current seed script
```

**backend/prisma/seed.production.ts** - Production initial data
```typescript
// Only essential data (admin user, default settings)
```

**Run specific seed:**
```bash
ts-node prisma/seed.minimal.ts
ts-node prisma/seed.full.ts
```

---

## 🔍 Common Database Operations

### Viewing Data (Command Line)

```bash
# Connect to database
psql -U iguser -d instagram_clone -h localhost

# List all tables
\dt

# View table structure
\d users
\d posts

# Count records
SELECT 'users' as table, COUNT(*) as count FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments;

# View recent posts
SELECT p.id, u.username, p.caption, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

# Find verified users
SELECT username, email, is_verified FROM users WHERE is_verified = true;

# Exit
\q
```

### Clearing Specific Data

```bash
# Connect
psql -U iguser -d instagram_clone -h localhost

# Delete all comments
DELETE FROM comments;

# Delete all posts (cascades to comments and likes)
DELETE FROM posts;

# Delete a specific user's data
DELETE FROM users WHERE username = 'test_user';

# Reset auto-incrementing IDs (if using SERIAL instead of UUID)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
```

---

## 🚀 Performance Optimization

### Check Indexes

Your schema already has good indexes, but here's how to verify:

```sql
-- See all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Find missing indexes (queries that are slow)
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100;
```

### Add More Indexes (if needed)

```prisma
// In schema.prisma
model Post {
  // ...
  @@index([createdAt])        // Already has this
  @@index([userId, createdAt]) // Composite index for user's posts
}
```

Then run: `npm run prisma:migrate`

### Connection Pooling (Production)

For production, use **Prisma Accelerate** or **PgBouncer**:

```env
# Example with connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

### Query Optimization

```typescript
// ❌ Bad: N+1 queries
const posts = await prisma.post.findMany();
for (const post of posts) {
  const user = await prisma.user.findUnique({ where: { id: post.userId } });
}

// ✅ Good: Include related data
const posts = await prisma.post.findMany({
  include: {
    user: {
      select: { id: true, username: true, avatar: true }
    },
    _count: { select: { likes: true, comments: true } }
  }
});
```

---

## 📊 Monitoring & Debugging

### Enable Query Logging

```typescript
// backend/src/utils/db.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Analyze Slow Queries

```bash
# Enable slow query logging in PostgreSQL
psql -U postgres

ALTER DATABASE instagram_clone SET log_min_duration_statement = 1000;
# Logs queries taking > 1 second

# View logs
tail -f /opt/homebrew/var/log/postgresql@14.log
```

### Database Size

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('instagram_clone'));

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🛡️ Security Best Practices

### 1. Never Commit Credentials

```bash
# .gitignore already has:
.env
.env.local
```

### 2. Use Different Users for Different Environments

```sql
-- Read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE instagram_clone TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Backup user
CREATE USER backup_user WITH PASSWORD 'secure_password';
GRANT pg_read_all_data TO backup_user;
```

### 3. Secure Connection Strings

```env
# Production: Use SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"

# Use environment-specific variables
DATABASE_URL="${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
```

---

## 🔧 Maintenance Tasks

### Weekly Tasks

```bash
# 1. Backup database
./backend/scripts/backup.sh

# 2. Analyze database
psql -U iguser -d instagram_clone -c "ANALYZE;"

# 3. Vacuum (cleanup)
psql -U iguser -d instagram_clone -c "VACUUM ANALYZE;"
```

### Monthly Tasks

```bash
# Check for bloat
psql -U iguser -d instagram_clone -c "VACUUM FULL ANALYZE;"

# Update statistics
psql -U iguser -d instagram_clone -c "ANALYZE VERBOSE;"
```

### Monitor Disk Space

```bash
# Check PostgreSQL data directory size
du -sh /opt/homebrew/var/postgresql@14

# Check database size
psql -U iguser -d instagram_clone -c "SELECT pg_size_pretty(pg_database_size('instagram_clone'));"
```

---

## 📋 Quick Reference

| Task | Command |
|------|---------|
| Visual DB browser | `npm run prisma:studio` |
| Create migration | `npm run prisma:migrate` |
| Apply migrations | `npx prisma migrate deploy` |
| Seed database | `npm run prisma:seed` |
| Reset database | `npx prisma migrate reset` |
| Backup database | `pg_dump -U iguser instagram_clone > backup.sql` |
| Restore database | `psql -U iguser instagram_clone < backup.sql` |
| Connect via CLI | `psql -U iguser -d instagram_clone -h localhost` |
| View logs | `tail -f /opt/homebrew/var/log/postgresql@14.log` |

---

## 🎯 Recommended Workflow

### For Development (Daily)

1. **Use Prisma Studio** for quick data inspection
2. **Re-seed often** when testing features: `npm run prisma:seed`
3. **Don't worry about data loss** - it's just test data
4. **Commit schema changes** with migrations

### For Testing Features

1. **Reset database**: `npx prisma migrate reset`
2. **Seed with test data**: `npm run prisma:seed`
3. **Test your feature**
4. **Repeat as needed**

### For Production Deployment

1. **Backup production DB** before any changes
2. **Test migrations** on staging database
3. **Use `prisma migrate deploy`** (not `migrate dev`)
4. **Monitor application** after deployment
5. **Keep backups** for rollback

---

## 🆘 Troubleshooting

### "Database does not exist"
```bash
psql -U postgres -c "CREATE DATABASE instagram_clone OWNER iguser;"
```

### "Migration failed"
```bash
# Reset and try again
npx prisma migrate reset
npm run prisma:migrate
```

### "Out of sync"
```bash
npx prisma migrate resolve --applied <migration_name>
# or
npx prisma db push
```

### "Performance issues"
```bash
# Rebuild indexes
psql -U iguser -d instagram_clone -c "REINDEX DATABASE instagram_clone;"

# Vacuum and analyze
psql -U iguser -d instagram_clone -c "VACUUM FULL ANALYZE;"
```

---

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Prisma Studio**: Built-in visual editor
- **TablePlus/pgAdmin**: Alternative GUI tools

---

**TL;DR**: Use **Prisma Studio** for daily work, **migrations** for schema changes, **backups** before major changes, and **seeding** for test data.
