'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Role, Prisma } from '@prisma/client'; // 1. Import Prisma
import { revalidatePath } from 'next/cache';

// 2. Define a type for the recent comment list
type RecentComment = Prisma.CommentGetPayload<{
  include: { 
    article: { 
      select: { title: true, slug: true }
    }
  }
}>;

// 3. Update ProfileData type
export type ProfileData = {
  commentCount: number;
  articleCount: number;
  recentComments: RecentComment[];
  commentActivity: { createdAt: Date }[]; // 4. Add data for the chart
};

/**
 * Fetches supplemental data for the profile page
 */
export async function getProfileData(): Promise<ProfileData> { // 5. Return explicit type
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated.');
  }
  const userId = session.user.id;

  try {
    // 6. Fetch all data in parallel
    const [commentCount, articleCount, recentComments, commentActivity] = await Promise.all([
      prisma.comment.count({
        where: { authorId: userId },
      }),
      prisma.article.count({
        where: { authorId: userId },
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          article: {
            select: { title: true, slug: true },
          },
        },
      }),
      // 7. NEW: Fetch all comment dates for the chart
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      })
    ]);

    return { commentCount, articleCount, recentComments, commentActivity };
  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    throw new Error('Could not load profile data.');
  }
}

/**
 * Deletes the currently logged-in user's account.
 * Admins cannot delete their own accounts this way.
 */
export async function deleteOwnAccount(): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }
  const userId = session.user.id;

  // Safety check: Prevent admins from deleting themselves here.
  if (session.user.role === Role.ADMIN) {
    return {
      success: false,
      message: 'Admins cannot be deleted from this page. Use the Admin Panel.',
    };
  }

  try {
    // The Prisma schema's onDelete: Cascade will handle deleting
    // articles, comments, sessions, accounts, etc.
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/admin');
    
    // The user will be signed out on the client after this
    return { success: true, message: 'Account deleted successfully.' };

  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}

