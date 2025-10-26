import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../types/express';

export const savePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: req.user!.userId,
          postId,
        },
      },
    });

    if (existingSave) {
      res.status(400).json({ error: 'Post already saved' });
      return;
    }

    // Save post
    await prisma.savedPost.create({
      data: {
        userId: req.user!.userId,
        postId,
      },
    });

    res.status(201).json({ message: 'Post saved successfully' });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unsavePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: req.user!.userId,
          postId,
        },
      },
    });

    if (!savedPost) {
      res.status(404).json({ error: 'Saved post not found' });
      return;
    }

    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId: req.user!.userId,
          postId,
        },
      },
    });

    res.json({ message: 'Post unsaved successfully' });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSavedPosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: req.user!.userId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
                isVerified: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = savedPosts.map(sp => sp.post);
    res.json({ posts });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
