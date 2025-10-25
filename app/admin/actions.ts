'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Role, ApplicationStatus } from '@prisma/client';
import { auth } from '@/auth';

// --- User Actions ---
// ... (updateUserRole, deleteUser remain the same) ...
export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }
  if (session.user.id === userId && newRole !== 'ADMIN') {
    throw new Error('Admin cannot change their own role.');
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, message: 'Failed to update user role.' };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }
  if (session.user.id === userId) {
    throw new Error('Admin cannot delete their own account.');
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user.' };
  }
}


// --- Contact Message Actions ---
// ... (markContactMessageRead, deleteContactMessage remain the same) ...
export async function markContactMessageRead(
  messageId: string,
  isRead: boolean
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  try {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: isRead },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating contact message status:', error);
    return { success: false, message: 'Failed to update message status.' };
  }
}

export async function deleteContactMessage(messageId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  try {
    await prisma.contactMessage.delete({ where: { id: messageId } });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return { success: false, message: 'Failed to delete message.' };
  }
}

// --- Blogger Application Actions ---
// ... (approveBloggerApplication, rejectBloggerApplication remain the same) ...
export async function approveBloggerApplication(
  applicationId: string,
  userId: string
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  try {
    await prisma.$transaction([
      prisma.bloggerApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.APPROVED },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: Role.BLOGGER },
      }),
    ]);

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, message: 'Failed to approve application.' };
  }
}

export async function rejectBloggerApplication(applicationId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  try {
    await prisma.bloggerApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.REJECTED },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, message: 'Failed to reject application.' };
  }
}


// --- Article Action ---
// ... (deleteArticle remains the same) ...
export async function deleteArticle(articleId: string) {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated.' };
    }
    const userId = session.user.id;
    const userRole = session.user.role;

    try {
        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { authorId: true, slug: true },
        });

        if (!article) {
             return { success: false, message: 'Article not found.' };
        }

        if (userRole !== Role.ADMIN && article.authorId !== userId) {
             return { success: false, message: 'Not authorized to delete this article.' };
        }

        await prisma.article.delete({
            where: { id: articleId },
        });

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        revalidatePath('/');
        if (article.slug) {
            revalidatePath(`/blog/${article.slug}`);
        }

        return { success: true };
    } catch (error) {
      console.error('Error deleting article:', error);
      return { success: false, message: 'Failed to delete article.' };
    }
}

// --- START: New Category Actions ---
export async function createCategory(data: { name: string, slug: string }) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: 'Not authorized.' };
    }

    const { name, slug } = data;
    if (!name || !slug) {
        return { success: false, message: 'Name and slug are required.' };
    }

    try {
        // Check if slug is unique
        const existingCategory = await prisma.category.findFirst({
            where: { OR: [{ name: name }, { slug: slug }] }
        });
        if (existingCategory) {
            return { success: false, message: 'Category name or slug already exists.' };
        }

        await prisma.category.create({
            data: {
                name: name,
                slug: slug,
            }
        });

        revalidatePath('/admin');
        revalidatePath('/dashboard/articles/new'); // Revalidate new article page to show new category
        return { success: true };

    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}

export async function deleteCategory(categoryId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: 'Not authorized.' };
    }

    try {
        // Prisma's default behavior for many-to-many relations is to just remove
        // the entries from the join table, which is what we want.
        // If this fails due to a relation issue, we'd need to disconnect articles first.
        await prisma.category.delete({
            where: { id: categoryId },
        });

        revalidatePath('/admin');
        revalidatePath('/dashboard/articles/new'); // Revalidate new article page
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        // Provide a more helpful error if it's a foreign key constraint
        if (error instanceof Error && (error as any).code === 'P2003') { // Prisma foreign key constraint fail
             return { success: false, message: 'Cannot delete category. Please ensure no articles are using it.' };
        }
        return { success: false, message: 'Failed to delete category.' };
    }
}

export async function getCategories() {
    const session = await auth();
    // Allow any logged-in user to *see* categories for posting
    if (!session?.user?.id) { 
        throw new Error('Not authenticated.');
    }

    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return []; // Return empty on error
    }
}
// --- END: New Category Actions ---

