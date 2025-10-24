'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Role, ApplicationStatus } from '@prisma/client'; // Add ApplicationStatus
import { auth } from '@/auth';

// --- User Actions ---

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
    // Use a transaction to update both application and user role
    await prisma.$transaction([
      prisma.bloggerApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.APPROVED },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: Role.BLOGGER }, // Update user's role
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