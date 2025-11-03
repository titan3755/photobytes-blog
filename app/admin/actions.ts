'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Role, ApplicationStatus, OrderStatus, ServiceName, OperationalStatus } from '@prisma/client';
import { auth } from '@/auth';

// ... (createCategory, deleteCategory, getCategories) ...
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
        const existingCategory = await prisma.category.findFirst({
            where: { OR: [{ name: name }, { slug: slug }] }
        });
        if (existingCategory) {
            return { success: false, message: 'Category name or slug already exists.' };
        }
        await prisma.category.create({
            data: { name: name, slug: slug }
        });
        revalidatePath('/admin');
        revalidatePath('/dashboard/articles/new');
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
        await prisma.category.delete({
            where: { id: categoryId },
        });
        revalidatePath('/admin');
        revalidatePath('/dashboard/articles/new');
        return { success: true };
    } catch {
        return { success: false, message: 'Failed to delete category.' };
    }
}
export async function getCategories() {
    const session = await auth();
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
        return [];
    }
}

// --- User Actions ---
export async function toggleCommentStatus(
  userId: string,
  currentStatus: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Not authorized.' };
  }
  if (session.user.id === userId) {
    return { success: false, message: 'Admin cannot change their own comment status.' };
  }
  try {
    const newStatus = !currentStatus;
    await prisma.user.update({
      where: { id: userId },
      // --- START FIX: Increment sessionVersion ---
      data: { 
        canComment: newStatus,
        sessionVersion: { increment: 1 } 
      },
      // --- END FIX ---
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true, message: `User commenting ${newStatus ? 'enabled' : 'disabled'}.` };
  } catch (error) {
    console.error('Error toggling comment status:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}

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
      // --- START FIX: Increment sessionVersion ---
      data: { 
        role: newRole,
        sessionVersion: { increment: 1 }
      },
      // --- END FIX ---
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
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
    // Deleting the user will cascade-delete their sessions, so no extra code needed here
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user.' };
  }
}

// --- Contact Message Actions ---
// ... (markContactMessageRead, deleteContactMessage) ...
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
        // --- START FIX: Increment sessionVersion ---
        data: { 
          role: Role.BLOGGER,
          sessionVersion: { increment: 1 }
        },
        // --- END FIX ---
      }),
    ]);

    revalidatePath('/admin');
    revalidatePath('/dashboard');
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
    const app = await prisma.bloggerApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.REJECTED },
    });

    // --- START FIX: Increment sessionVersion (for consistency) ---
    await prisma.user.update({
      where: { id: app.userId },
      data: { sessionVersion: { increment: 1 } }
    });
    // --- END FIX ---

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, message: 'Failed to reject application.' };
  }
}

// --- Article Action ---
// ... (deleteArticle) ...
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

// --- Notification Actions ---
// ... (sendNotification, markNotificationAsRead, deleteNotification) ...
export type TargetAudience = 'ALL_USERS' | 'ALL_BLOGGERS' | 'ALL_ADMINS' | { userId: string };
interface SendNotificationData {
    title: string;
    description: string;
    url?: string | null;
    target: TargetAudience;
}
export async function sendNotification(data: SendNotificationData): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: 'Not authorized.' };
    }
    const { title, description, url, target } = data;
    if (!title || !description) {
        return { success: false, message: 'Title and description are required.' };
    }
    try {
        const newNotification = await prisma.notification.create({
            data: { title, description, url: url || null },
        });
        let targetUserIds: { id: string }[] = [];
        if (target === 'ALL_USERS') {
            targetUserIds = await prisma.user.findMany({ select: { id: true } });
        } else if (target === 'ALL_BLOGGERS') {
            targetUserIds = await prisma.user.findMany({ where: { role: Role.BLOGGER }, select: { id: true } });
        } else if (target === 'ALL_ADMINS') {
            targetUserIds = await prisma.user.findMany({ where: { role: Role.ADMIN }, select: { id: true } });
        } else if (typeof target === 'object' && target.userId) {
            const userExists = await prisma.user.findUnique({ where: { id: target.userId }, select: { id: true }});
            if (userExists) {
                targetUserIds = [{ id: userExists.id }];
            } else {
                await prisma.notification.delete({ where: { id: newNotification.id } });
                return { success: false, message: `User with ID ${target.userId} not found.` };
            }
        }
        if (targetUserIds.length === 0) {
             await prisma.notification.delete({ where: { id: newNotification.id } });
             return { success: false, message: 'No target users found for this notification.' };
        }
        await prisma.userNotification.createMany({
            data: targetUserIds.map(user => ({
                userId: user.id,
                notificationId: newNotification.id,
            })),
            skipDuplicates: true,
        });
        revalidatePath('/admin');
        revalidatePath('/dashboard'); 
        return { success: true, message: `Notification sent to ${targetUserIds.length} user(s).` };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}
export async function markNotificationAsRead(userNotificationId: string): Promise<{ success: boolean; message?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
         return { success: false, message: 'Not authenticated.' };
    }
    const userId = session.user.id;
    try {
        const notificationLink = await prisma.userNotification.findUnique({
            where: { id: userNotificationId },
            select: { userId: true }
        });
        if (!notificationLink) {
             return { success: false, message: 'Notification not found.' };
        }
        if (notificationLink.userId !== userId) {
            return { success: false, message: 'Not authorized.' };
        }
        await prisma.userNotification.update({
            where: { id: userNotificationId },
            data: { isRead: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}
export async function deleteNotification(notificationId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: 'Not authorized.' };
    }
    try {
        await prisma.notification.delete({
            where: { id: notificationId },
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, message: 'Failed to delete notification.' };
    }
}

// --- Comment Action ---
// ... (deleteComment) ...
export async function deleteComment(commentId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Not authorized.' };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { article: { select: { slug: true } } },
    });
    
    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    if (comment?.article?.slug) {
        revalidatePath(`/blog/${comment.article.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, message: 'Failed to delete comment.' };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Not authorized.' };
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // --- START FIX: Increment sessionVersion for the user ---
    await prisma.user.update({
      where: { id: order.authorId },
      data: { sessionVersion: { increment: 1 } }
    });
    // --- END FIX ---
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update status.' };
  }
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Not authorized.' };
  }

  try {
    await prisma.order.delete({
      where: { id: orderId },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'Failed to delete order.' };
  }
}

async function checkAdminAuth() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return session; // Return session for convenience
}

export async function updateServiceStatus(
  serviceName: ServiceName,
  status: OperationalStatus,
): Promise<{ success: boolean; message: string }> {
  try {
    await checkAdminAuth(); // Secure the action

    await prisma.serviceStatus.update({
      where: { serviceName },
      data: { status },
    });

    revalidatePath('/admin'); // Revalidate admin page
    revalidatePath('/status'); // Revalidate public status page
    return { success: true, message: 'Status updated successfully.' };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

