export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  createdAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  caption?: string;
  imageUrl: string;
  location?: string;
  hideLikeCount?: boolean;
  commentsOff?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
    isVerified?: boolean;
  };
  comments?: Comment[];
  isLiked?: boolean;
  isSaved?: boolean;
  _count: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  text: string;
  postId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
