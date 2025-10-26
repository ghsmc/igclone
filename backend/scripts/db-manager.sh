#!/bin/bash

# Instagram Clone - Database Management Script
# Makes common database tasks easy!

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$BACKEND_DIR/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database credentials (from .env)
DB_USER="iguser"
DB_NAME="instagram_clone"
DB_HOST="localhost"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Instagram Clone - DB Manager         ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

show_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "  ${GREEN}1)${NC} Open Prisma Studio (Visual DB Browser)"
    echo "  ${GREEN}2)${NC} Seed Database (Add sample data)"
    echo "  ${GREEN}3)${NC} Reset Database (Fresh start)"
    echo "  ${GREEN}4)${NC} Backup Database"
    echo "  ${GREEN}5)${NC} Restore from Backup"
    echo "  ${GREEN}6)${NC} Run Migrations"
    echo "  ${GREEN}7)${NC} View Database Info"
    echo "  ${GREEN}8)${NC} Connect to Database (psql)"
    echo "  ${GREEN}9)${NC} Clear All Data (Keep Schema)"
    echo "  ${RED}0)${NC} Exit"
    echo ""
}

open_studio() {
    echo -e "${GREEN}Opening Prisma Studio...${NC}"
    echo "Access it at: http://localhost:5555"
    cd "$BACKEND_DIR"
    npm run prisma:studio
}

seed_database() {
    echo -e "${GREEN}Seeding database with sample data...${NC}"
    cd "$BACKEND_DIR"
    npm run prisma:seed
    echo -e "${GREEN}✓ Database seeded successfully!${NC}"
    echo "You can now log in with:"
    echo "  Email: travel@demo.com"
    echo "  Password: password123"
}

reset_database() {
    echo -e "${YELLOW}⚠️  WARNING: This will delete ALL data!${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${GREEN}Resetting database...${NC}"
        cd "$BACKEND_DIR"
        npx prisma migrate reset --force
        echo -e "${GREEN}✓ Database reset complete!${NC}"
    else
        echo "Cancelled."
    fi
}

backup_database() {
    mkdir -p "$BACKUP_DIR"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/instagram_$DATE.sql"

    echo -e "${GREEN}Creating backup...${NC}"
    pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > "$BACKUP_FILE"

    if [ -f "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo -e "${GREEN}✓ Backup created successfully!${NC}"
        echo "  File: $BACKUP_FILE"
        echo "  Size: $SIZE"

        # Compress if larger than 1MB
        if [ $(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE") -gt 1048576 ]; then
            echo "Compressing..."
            gzip "$BACKUP_FILE"
            echo "  Compressed: ${BACKUP_FILE}.gz"
        fi
    else
        echo -e "${RED}✗ Backup failed!${NC}"
    fi
}

restore_database() {
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo -e "${RED}No backups found!${NC}"
        return
    fi

    echo -e "${YELLOW}Available backups:${NC}"
    echo ""
    select BACKUP in "$BACKUP_DIR"/*; do
        if [ -n "$BACKUP" ]; then
            echo -e "${YELLOW}⚠️  This will replace current database!${NC}"
            read -p "Restore from $BACKUP? (yes/no): " -r
            if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                echo -e "${GREEN}Restoring from backup...${NC}"

                # Drop and recreate
                psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
                psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

                # Restore
                if [[ $BACKUP == *.gz ]]; then
                    gunzip -c "$BACKUP" | psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME"
                else
                    psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" < "$BACKUP"
                fi

                # Regenerate Prisma Client
                cd "$BACKEND_DIR"
                npm run prisma:generate

                echo -e "${GREEN}✓ Database restored successfully!${NC}"
            fi
            break
        fi
    done
}

run_migrations() {
    echo -e "${GREEN}Running migrations...${NC}"
    cd "$BACKEND_DIR"
    npm run prisma:migrate
    echo -e "${GREEN}✓ Migrations complete!${NC}"
}

view_info() {
    echo -e "${BLUE}Database Information:${NC}"
    echo ""

    # Database size
    DB_SIZE=$(psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
    echo "  Database Size: $DB_SIZE"
    echo ""

    # Table counts
    echo "  Record Counts:"
    psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" -c "
    SELECT 'Users:' as table, COUNT(*)::text as count FROM users
    UNION ALL
    SELECT 'Posts:', COUNT(*)::text FROM posts
    UNION ALL
    SELECT 'Comments:', COUNT(*)::text FROM comments
    UNION ALL
    SELECT 'Likes:', COUNT(*)::text FROM likes
    UNION ALL
    SELECT 'Follows:', COUNT(*)::text FROM follows
    UNION ALL
    SELECT 'Saved Posts:', COUNT(*)::text FROM saved_posts;
    " 2>/dev/null | grep -v "count" | grep -v "\-\-" | grep -v "rows"

    echo ""
    echo "  Connection: postgresql://$DB_USER@$DB_HOST/$DB_NAME"
}

connect_psql() {
    echo -e "${GREEN}Connecting to database...${NC}"
    echo "Type \\q to exit"
    echo ""
    psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME"
}

clear_data() {
    echo -e "${YELLOW}⚠️  This will delete all data but keep the schema${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${GREEN}Clearing data...${NC}"
        psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" << EOF
        TRUNCATE saved_posts, comments, likes, follows, posts, users CASCADE;
EOF
        echo -e "${GREEN}✓ Data cleared!${NC}"
    else
        echo "Cancelled."
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-9]: " choice

    case $choice in
        1) open_studio ;;
        2) seed_database ;;
        3) reset_database ;;
        4) backup_database ;;
        5) restore_database ;;
        6) run_migrations ;;
        7) view_info ;;
        8) connect_psql ;;
        9) clear_data ;;
        0) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
done
