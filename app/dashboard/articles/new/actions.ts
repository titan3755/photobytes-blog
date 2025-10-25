'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Role } from '@prisma/client';

interface CreateArticleResult {
  success: boolean;
  message?: string;
  articleId?: string;
}

// Update interface to include categoryIds
interface ArticleData {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    published: boolean;
    categoryIds?: string[]; // Add categoryIds array (optional)
}

export async function createArticle(data: ArticleData): Promise<CreateArticleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }
  const userRole = session.user.role;
  if (userRole !== Role.ADMIN && userRole !== Role.BLOGGER) {
     return { success: false, message: 'Not authorized to create articles.' };
  }

  // Destructure categoryIds
  const { title, slug, content, excerpt, featuredImage, published, categoryIds } = data;

  if (!title || !slug || !content) {
    return { success: false, message: 'Title, Slug, and Content are required.' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { success: false, message: 'Invalid slug format.' };
  }

  try {
    const existingArticle = await prisma.article.findUnique({
      where: { slug: slug },
      select: { id: true },
    });

    if (existingArticle) {
      return { success: false, message: 'Slug already exists. Please choose a unique one.' };
    }

    const newArticle = await prisma.article.create({
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published,
        authorId: session.user.id,
        // --- START: Connect Categories ---
        categories: categoryIds && categoryIds.length > 0
            ? {
                connect: categoryIds.map(id => ({ id: id })),
              }
            : undefined,
        // --- END: Connect Categories ---
      },
    });

    if (published) {
        revalidatePath('/');
    }
    revalidatePath('/dashboard');

    return { success: true, articleId: newArticle.id };

  } catch (error) {
    console.error('Error creating article:', error);
    if (error instanceof Error && (error as any).code === 'P2002') { // More specific check for unique constraint
         return { success: false, message: 'This slug is already in use.' };
    }
    return { success: false, message: 'An internal error occurred while saving the article.' };
  }
}
