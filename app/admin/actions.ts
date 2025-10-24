'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { auth } from '@/auth'; // To ensure only admins can perform actions

// --- User Actions ---

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  // Prevent admin from changing their own role via this action
  if (session.user.id === userId && newRole !== 'ADMIN') {
      throw new Error('Admin cannot change their own role.');
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath('/admin'); // Refresh the admin page data
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

  // Prevent admin from deleting themselves
  if (session.user.id === userId) {
      throw new Error('Admin cannot delete their own account.');
  }

  try {
    // Note: onDelete: Cascade in your schema should handle related data (Accounts, Sessions, Articles)
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath('/admin'); // Refresh the admin page data
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user.' };
  }
}

// --- Contact Message Actions ---

export async function markContactMessageRead(messageId: string, isRead: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  try {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: isRead }, // Set to the desired state (true for read, false for unread)
    });
    revalidatePath('/admin'); // Refresh the admin page data
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
    await prisma.contactMessage.delete({
      where: { id: messageId },
    });
    revalidatePath('/admin'); // Refresh the admin page data
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return { success: false, message: 'Failed to delete message.' };
  }
}