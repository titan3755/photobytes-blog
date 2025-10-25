'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

interface CommentResult {
  success: boolean;
  message?: string;
}

export async function postComment(
  articleId: string,
  content: string
): Promise<CommentResult> {
  const session = await auth();

  // 1. Check Authentication
  if (!session?.user?.id) {
    return { success: false, message: 'You must be logged in to comment.' };
  }
  
  // 2. Check Authorization (canComment)
  if (!session.user.canComment) {
      return { success: false, message: 'You are not permitted to comment.' };
  }

  // 3. Validate Content
  if (!content || content.trim().length === 0) {
    return { success: false, message: 'Comment cannot be empty.' };
  }
  if (content.length > 1000) { // Optional: Set a max length
      return { success: false, message: 'Comment is too long (max 1000 characters).' };
  }

  try {
    // 4. Create Comment
    await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        articleId: articleId,
      },
    });

    // 5. Revalidate the article page to show the new comment
    // We need the article slug for this. Let's fetch it.
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { slug: true }
    });
    
    if (article) {
        revalidatePath(`/blog/${article.slug}`);
    }
    revalidatePath('/dashboard'); // Revalidate dashboard (for recent comments)

    return { success: true };
  } catch (error) {
    console.error('Error posting comment:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}
