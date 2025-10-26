# Database Management Scripts

## Quick Start

### Interactive Database Manager (Recommended!)

```bash
./backend/scripts/db-manager.sh
```

This launches an interactive menu with all common database tasks:

```
╔════════════════════════════════════════╗
║   Instagram Clone - DB Manager         ║
╚════════════════════════════════════════╝

What would you like to do?

  1) Open Prisma Studio (Visual DB Browser)
  2) Seed Database (Add sample data)
  3) Reset Database (Fresh start)
  4) Backup Database
  5) Restore from Backup
  6) Run Migrations
  7) View Database Info
  8) Connect to Database (psql)
  9) Clear All Data (Keep Schema)
  0) Exit
```

Super easy! Just run the script and pick what you need.

## Common Workflows

### First Time Setup
```bash
./backend/scripts/db-manager.sh
# Choose: 6) Run Migrations
# Choose: 2) Seed Database
# Choose: 1) Open Prisma Studio
```

### Testing a Feature
```bash
./backend/scripts/db-manager.sh
# Choose: 3) Reset Database (fresh start with sample data)
```

### Before Major Changes
```bash
./backend/scripts/db-manager.sh
# Choose: 4) Backup Database
```

### Inspecting Data
```bash
./backend/scripts/db-manager.sh
# Choose: 1) Open Prisma Studio
# Or: 7) View Database Info
```

## Manual Commands

If you prefer command-line:

```bash
cd backend

# Visual database browser
npm run prisma:studio

# Seed sample data
npm run prisma:seed

# Run migrations
npm run prisma:migrate

# Reset everything
npx prisma migrate reset
```

## Backup Location

Backups are stored in: `backend/backups/`

Files are automatically compressed if over 1MB.

## Need Help?

Read the full guide: `DATABASE_MANAGEMENT.md`
