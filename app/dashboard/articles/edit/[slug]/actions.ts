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
  categoryIds?: string[]; // Added category IDs
}

// --- Action 1: Fetch Article Data (Updated) ---
// We now fetch the article *with* its category IDs
export async function fetchArticleForEdit(slug: string) { // Removed explicit return type to let TS infer the included relation
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated.');
  }
  const userId = session.user.id;
  const userRole = session.user.role;

  // Fetch the article and include its categories
  const article = await prisma.article.findUnique({
    where: { slug: slug },
    include: {
      categories: {
        select: { id: true }, // Select only the IDs of connected categories
      },
    },
  });

  // Authorization check: User must be the author OR an Admin
  if (!article || (article.authorId !== userId && userRole !== Role.ADMIN)) {
    return null; // Return null if not found or unauthorized
  }

  return article; // Returns Article & { categories: {id: string}[] }
}

// --- Action 2: Update Article Data (Updated) ---
export async function updateArticle(data: ArticleData): Promise<UpdateArticleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }
  // Destructure categoryIds
  const {
    articleId,
    title,
    slug,
    content,
    excerpt,
    featuredImage,
    published,
    categoryIds, // Get the category IDs
  } = data;
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
    // 2. Verify Authorization (remains the same)
    const originalArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, published: true },
    });
    if (!originalArticle || (originalArticle.authorId !== userId && userRole !== Role.ADMIN)) {
      return { success: false, message: 'Unauthorized to edit this article.' };
    }

    // 3. Check for Slug Conflicts (remains the same)
    const existingSlug = await prisma.article.findUnique({
      where: { slug: slug },
      select: { id: true },
    });
    if (existingSlug && existingSlug.id !== articleId) {
      return { success: false, message: 'Slug already exists. Please choose a unique one.' };
    }

    // 4. Update the article (with categories)
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published,
        updatedAt: new Date(),
        // --- START: Update Categories ---
        // Use Prisma's 'set' operation for many-to-many relations.
        // This disconnects all old categories and connects all new ones.
        categories: {
          set: categoryIds ? categoryIds.map((id) => ({ id: id })) : [],
        },
        // --- END: Update Categories ---
      },
    });

    // 5. Revalidate Paths (remains the same)
    revalidatePath('/');
    revalidatePath(`/blog/${slug}`); // Revalidate the specific article page
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}