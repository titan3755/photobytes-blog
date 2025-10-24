'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Get session server-side
import { Role } from '@prisma/client';

interface CreateArticleResult {
  success: boolean;
  message?: string;
  articleId?: string; // Optionally return the ID of the created article
}

interface ArticleData {
    title: string;
    slug: string;
    content: string; // HTML content from Tiptap
    excerpt?: string | null;
    featuredImage?: string | null;
    published: boolean;
}

export async function createArticle(data: ArticleData): Promise<CreateArticleResult> {
  // 1. Get Session & Verify Role
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }
  const userRole = session.user.role;
  if (userRole !== Role.ADMIN && userRole !== Role.BLOGGER) {
     return { success: false, message: 'Not authorized to create articles.' };
  }

  const { title, slug, content, excerpt, featuredImage, published } = data;

  // 2. Validate Data (Basic)
  if (!title || !slug || !content) {
    return { success: false, message: 'Title, Slug, and Content are required.' };
  }
  // Simple slug format check (matches frontend)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { success: false, message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens.' };
  }


  try {
    // 3. Check if slug is unique
    const existingArticle = await prisma.article.findUnique({
      where: { slug: slug },
      select: { id: true }, // Only need to check existence
    });

    if (existingArticle) {
      return { success: false, message: 'Slug already exists. Please choose a unique one.' };
    }

    // 4. Create the article
    const newArticle = await prisma.article.create({
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt || null, // Ensure null if empty
        featuredImage: featuredImage || null, // Ensure null if empty
        published: published,
        authorId: session.user.id, // Link to the logged-in user
      },
    });

    // 5. Revalidate Paths (optional but recommended)
    // Revalidate the homepage to show the new article if published
    if (published) {
        revalidatePath('/');
    }
    // Revalidate the dashboard to show the new article in the user's list
    revalidatePath('/dashboard');

    return { success: true, articleId: newArticle.id };

  } catch (error) {
    console.error('Error creating article:', error);
    // Be cautious about exposing detailed errors
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         return { success: false, message: 'Slug might already exist (database check).' };
    }
    return { success: false, message: 'An internal error occurred while saving the article.' };
  }
}
