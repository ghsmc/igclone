import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../types/express';

export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Can't follow yourself
    if (userId === req.user!.userId) {
      res.status(400).json({ error: 'You cannot follow yourself' });
      return;
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.userId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    // Create follow
    await prisma.follow.create({
      data: {
        followerId: req.user!.userId,
        followingId: userId,
      },
    });

    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.userId,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      res.status(404).json({ error: 'You are not following this user' });
      return;
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.user!.userId,
          followingId: userId,
        },
      },
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFollowers = async (
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

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followersList = followers.map(f => f.follower);

    res.json({ followers: followersList });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFollowing = async (
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

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followingList = following.map(f => f.following);

    res.json({ following: followingList });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
