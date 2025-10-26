# Instagram Clone - Complete Setup Guide

## Important: Fix Prisma Client First

The Prisma client generation failed in the development environment due to network restrictions. You need to run this on your Mac:

```bash
cd ~/Desktop/igclone/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# When prompted for migration name, enter: instagram_features
```

## Quick Start (After Prisma Fix)

### 1. Ensure PostgreSQL is Running

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Start if not running
brew services start postgresql@14
```

### 2. Verify Database Setup

```bash
# Connect to verify
psql -U iguser -d instagram_clone -h localhost

# You should see: instagram_clone=>
# Type \q to exit
```

### 3. Check Your .env File

Make sure `backend/.env` has:

```env
DATABASE_URL="postgresql://iguser:newpassword@localhost:5432/instagram_clone?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=uploads
```

### 4. Start the Application

**Option A: Both servers together**
```bash
# From the igclone directory
npm run dev
```

**Option B: Separate terminals**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio** (Database GUI): `cd backend && npm run prisma:studio`

## What's New in This Version

### Database Enhancements
- ✅ **Verified badges** for users
- ✅ **Private accounts** option
- ✅ **Saved posts** feature
- ✅ **Post location** field
- ✅ **Hide like count** option
- ✅ **Comments off** toggle

### UI Improvements
- ✨ Instagram-authentic design with proper colors and spacing
- ✨ Better typography and fonts
- ✨ Verified badge display
- ✨ Improved navigation bar
- ✨ Enhanced button styles
- ✨ Better form inputs
- ✨ Professional avatar styling

### New Features
- 📌 Save/unsave posts
- 📍 Location on posts
- 🔒 Private account support
- ✓ Verified badge system
- 🎨 Instagram-like color scheme

## Troubleshooting

### "Prisma Client did not initialize yet"

This is the error you're seeing. Fix it by running on your Mac:

```bash
cd backend
rm -rf node_modules/.prisma node_modules/@prisma/client
npm install
npm run prisma:generate
npm run prisma:migrate
```

### "relation does not exist" errors

You need to run migrations:

```bash
cd backend
npm run prisma:migrate
```

### Port already in use

Kill the process or change ports:

```bash
# Find what's using port 3001
lsof -ti:3001 | xargs kill -9

# Find what's using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection errors

```bash
# Make sure PostgreSQL is running
brew services start postgresql@14

# Test connection
psql -U iguser -d instagram_clone -h localhost
```

## Development Commands

```bash
# Backend
cd backend
npm run dev                # Start development server
npm run build             # Build for production
npm run prisma:studio     # Open database GUI
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations

# Frontend
cd frontend
npm run dev               # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Root
npm run dev              # Run both frontend and backend
```

## API Endpoints

### New Endpoints

**Saved Posts**
- `POST /api/saved/:postId` - Save a post
- `DELETE /api/saved/:postId` - Unsave a post
- `GET /api/saved` - Get all saved posts

## Database Schema Updates

The schema now includes:

```prisma
model User {
  isVerified   Boolean  @default(false)  // New
  isPrivate    Boolean  @default(false)  // New
  savedPosts   SavedPost[]               // New relation
}

model Post {
  location      String?  // New
  hideLikeCount Boolean  @default(false)  // New
  commentsOff   Boolean  @default(false)  // New
  savedPosts    SavedPost[]                // New relation
}

model SavedPost {
  // New model for saved posts
}
```

## Testing the App

1. **Sign up** a new account at http://localhost:3000/signup
2. **Create a post** by clicking the + icon
3. **Like and comment** on posts
4. **Follow other users** (create multiple accounts to test)
5. **Save posts** using the new save feature
6. **View your profile** to see your posts grid

## Production Deployment Notes

Before deploying to production:

1. Change `JWT_SECRET` to a strong random value
2. Use a production PostgreSQL database
3. Set up cloud storage for images (AWS S3, Cloudinary)
4. Add rate limiting
5. Set up HTTPS
6. Configure CORS properly
7. Set `NODE_ENV=production`

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Verify PostgreSQL is running
3. Check that all environment variables are set
4. Make sure Prisma client is generated
5. Try clearing node_modules and reinstalling

---

**Next Steps**: Run the Prisma commands on your Mac, then start the app with `npm run dev`!
