'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Get session server-side

interface UpdateProfileResult {
  success: boolean;
  message?: string;
}

export async function updateProfile(data: {
  name: string;
  username: string;
}): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }

  const userId = session.user.id;
  const { name, username } = data;

  // Basic validation (redundant with client-side but good practice)
  if (!name || !username) {
    return { success: false, message: 'Name and username cannot be empty.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
       return { success: false, message: 'Username can only contain letters, numbers, and underscores.' };
  }


  try {
    // Check if the NEW username is already taken by ANOTHER user
    if (username !== session.user.username) { // Only check if username actually changed
      const existingUser = await prisma.user.findUnique({
        where: { username: username },
        select: { id: true }, // Only need ID to check existence
      });

      if (existingUser && existingUser.id !== userId) {
        return { success: false, message: 'Username is already taken.' };
      }
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        username: username,
      },
    });

    // Revalidate relevant paths if needed (e.g., dashboard, profile page)
    revalidatePath('/dashboard');
    revalidatePath('/profile/edit'); // Revalidate this page itself if needed

    return { success: true };

  } catch (error) {
    console.error('Error updating profile:', error);
    // Be careful not to expose detailed database errors
    return { success: false, message: 'An internal error occurred.' };
  }
}