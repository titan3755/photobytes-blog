'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

interface CommentResult {
  success: boolean;
  message?: string;
}

const MAX_COMMENT_LENGTH = 1000; // 1. Define your character limit

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

  // --- START: New Validation ---
  // 4. Enforce Character Limit on Server
  if (content.length > MAX_COMMENT_LENGTH) {
      return { success: false, message: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` };
  }
  // --- END: New Validation ---

  try {
    // 5. Create Comment
    await prisma.comment.create({
      data: {
        content: content.trim(), // Use the trimmed content
        authorId: session.user.id,
        articleId: articleId,
      },
    });

    // 6. Revalidate Paths
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { slug: true }
    });
    
    if (article) {
        revalidatePath(`/blog/${article.slug}`);
    }
    revalidatePath('/dashboard');

    return { success: true, message: "Comment posted!" };
  } catch (error) {
    console.error('Error posting comment:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}