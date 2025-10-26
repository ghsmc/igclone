import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthRequest } from '../types/express';

const createCommentSchema = z.object({
  text: z.string().min(1).max(500),
});

export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const { text } = createCommentSchema.parse(req.body);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        postId,
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
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
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

    res.json({ comments });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== req.user!.userId) {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
