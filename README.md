# Instagram Clone

A full-stack Instagram clone built with TypeScript, React, Node.js, Express, and Prisma.

## Features

### Backend
- **Authentication**: JWT-based authentication with signup, login, and protected routes
- **User Management**: User profiles with bio, avatar, website, followers/following counts
- **Posts**: Create posts with images and captions, view feed from followed users
- **Interactions**: Like/unlike posts, comment on posts
- **Social Features**: Follow/unfollow users, view followers/following lists
- **File Upload**: Image upload support using Multer
- **Database**: PostgreSQL with Prisma ORM

### Frontend
- **Modern UI**: Clean, Instagram-inspired interface
- **Authentication**: Login and signup pages with form validation
- **Feed**: Scrollable feed showing posts from followed users
- **Post Creation**: Upload images with captions
- **User Profiles**: View user profiles with posts grid, stats, and follow button
- **Interactions**: Like/unlike posts, add comments in real-time
- **Responsive Design**: Mobile-friendly layout
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma (ORM)
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Zod for validation

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- Zustand (state management)

## Project Structure

```
instagram-clone/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── post.controller.ts
│   │   │   ├── like.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   └── follow.controller.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── utils/
│   │   │   ├── db.ts
│   │   │   └── jwt.ts
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   └── users.ts
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── PostCard.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── CreatePost.tsx
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd igclone
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials and JWT secret
# DATABASE_URL="postgresql://user:password@localhost:5432/instagram_clone?schema=public"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=3001

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

The backend server will start at `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will start at `http://localhost:3000`

### 4. Database Setup

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE instagram_clone;
```

Then run the Prisma migrations:

```bash
cd backend
npm run prisma:migrate
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users/search?q=query` - Search users (protected)

### Posts
- `POST /api/posts` - Create post (protected)
- `GET /api/posts/feed` - Get feed (protected)
- `GET /api/posts/:postId` - Get single post (protected)
- `GET /api/posts/user/:username` - Get user's posts (protected)
- `DELETE /api/posts/:postId` - Delete post (protected)

### Likes
- `POST /api/likes/:postId` - Like post (protected)
- `DELETE /api/likes/:postId` - Unlike post (protected)
- `GET /api/likes/:postId` - Get post likes (protected)

### Comments
- `POST /api/comments/:postId` - Create comment (protected)
- `GET /api/comments/:postId` - Get post comments (protected)
- `DELETE /api/comments/:commentId` - Delete comment (protected)

### Follow
- `POST /api/follow/:userId` - Follow user (protected)
- `DELETE /api/follow/:userId` - Unfollow user (protected)
- `GET /api/follow/followers/:username` - Get followers (protected)
- `GET /api/follow/following/:username` - Get following (protected)

## Development

### Run both servers concurrently

From the root directory:

```bash
npm install
npm run dev
```

### Database Management

View database in Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/instagram_clone?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=uploads
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3001/api
```

## Future Enhancements

- [ ] Stories feature
- [ ] Direct messaging
- [ ] Real-time notifications
- [ ] Image filters and editing
- [ ] Video posts
- [ ] Hashtags and explore page
- [ ] Saved posts
- [ ] Post sharing
- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Password reset
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Redis caching
- [ ] GraphQL API
- [ ] Mobile app (React Native)

## License

MIT

## Author

Built with TypeScript, React, and Node.js
