'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Role, Article } from '@prisma/client';

interface UpdateArticleResult {
  success: boolean;
  message?: string;
}

interface ArticleData {
    articleId: string; // Required for update
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    published: boolean;
}

// --- Action 1: Fetch Article Data ---
export async function fetchArticleForEdit(slug: string): Promise<Article | null> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated.');
    }
    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch the article
    const article = await prisma.article.findUnique({
        where: { slug: slug },
    });

    // Authorization check: User must be the author OR an Admin
    if (!article || (article.authorId !== userId && userRole !== Role.ADMIN)) {
        return null; // Return null if not found or unauthorized
    }

    return article;
}

// --- Action 2: Update Article Data ---
export async function updateArticle(data: ArticleData): Promise<UpdateArticleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }
  const { articleId, title, slug, content, excerpt, featuredImage, published } = data;
  const userId = session.user.id;
  const userRole = session.user.role;

  // 1. Basic Validation
  if (!title || !slug || !content || !articleId) {
    return { success: false, message: 'Article ID, Title, Slug, and Content are required.' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { success: false, message: 'Invalid slug format.' };
  }

  try {
    // 2. Verify Authorization & Check for Slug Conflicts
    const originalArticle = await prisma.article.findUnique({
        where: { id: articleId },
        select: { authorId: true, published: true },
    });

    if (!originalArticle || (originalArticle.authorId !== userId && userRole !== Role.ADMIN)) {
        return { success: false, message: 'Unauthorized to edit this article.' };
    }

    // Check if the NEW slug is already taken by a DIFFERENT article
    const existingSlug = await prisma.article.findUnique({
        where: { slug: slug },
        select: { id: true },
    });

    if (existingSlug && existingSlug.id !== articleId) {
        return { success: false, message: 'Slug already exists. Please choose a unique one.' };
    }

    // 3. Update the article
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published,
        updatedAt: new Date(), // Manually set updated time
      },
    });

    // 4. Revalidate Paths
    revalidatePath('/');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}
