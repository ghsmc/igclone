import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../types/express';

export const likePost = async (
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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: req.user!.userId,
        },
      },
    });

    if (existingLike) {
      res.status(400).json({ error: 'Post already liked' });
      return;
    }

    // Create like
    await prisma.like.create({
      data: {
        postId,
        userId: req.user!.userId,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    res.status(201).json({ message: 'Post liked', likeCount });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlikePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: req.user!.userId,
        },
      },
    });

    if (!like) {
      res.status(404).json({ error: 'Like not found' });
      return;
    }

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: req.user!.userId,
        },
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    res.json({ message: 'Post unliked', likeCount });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostLikes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ likes });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
