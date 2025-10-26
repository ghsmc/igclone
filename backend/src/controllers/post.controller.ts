import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthRequest } from '../types/express';

const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
});

export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image is required' });
      return;
    }

    const { caption } = createPostSchema.parse(req.body);

    // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just store the file path
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = await prisma.post.create({
      data: {
        caption: caption || '',
        imageUrl,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeed = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get posts from users that the current user follows + their own posts
    const following = await prisma.follow.findMany({
      where: { followerId: req.user!.userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);
    const userIds = [...followingIds, req.user!.userId];

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: req.user!.userId },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined, // Remove the likes array, we only needed it to check isLiked
    }));

    res.json({ posts: postsWithLikeStatus, page, limit });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: {
          where: { userId: req.user!.userId },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const postWithLikeStatus = {
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined,
    };

    res.json({ post: postWithLikeStatus });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserPosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.userId !== req.user!.userId) {
      res.status(403).json({ error: 'You can only delete your own posts' });
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
