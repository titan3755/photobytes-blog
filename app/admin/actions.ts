'use server';

import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Updates a user's role.
 * This is a Server Action.
 * @param userId - The ID of the user to update.
 * @param newRole - The new role to assign.
 */
export async function updateUserRole(userId: string, newRole: Role) {
  if (!userId || !newRole) {
    return { error: 'Invalid input. User ID and role are required.' };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Revalidate the /admin path to show the new data
    revalidatePath('/admin');

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: 'Failed to update user role.' };
  }
}

/**
 * Deletes a user.
 * This is a Server Action.
 * @param userId - The ID of the user to delete.
 */
export async function deleteUser(userId: string) {
  if (!userId) {
    return { error: 'Invalid input. User ID is required.' };
  }

  try {
    // You might want to add more checks here,
    // e.g., don't let an admin delete themselves.

    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the /admin path to show the new data
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Failed to delete user.' };
  }
}