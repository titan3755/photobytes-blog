'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcrypt'; // Import bcrypt

interface UpdateProfileResult {
  success: boolean;
  message?: string;
}

// Extend the input data type
interface UpdateProfileData {
    name: string;
    username: string;
    image?: string | null; // Optional image URL
    newPassword?: string | null; // Optional new password
}


export async function updateProfile(data: UpdateProfileData): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }

  const userId = session.user.id;
  const { name, username, image, newPassword } = data;

  // Basic validation
  if (!name || !username) {
    return { success: false, message: 'Name and username cannot be empty.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, message: 'Username can only contain letters, numbers, and underscores.' };
  }
  // Password validation (only if provided)
  if (newPassword && newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
  }
   // Optional: URL validation for image
  if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
    // Basic check, consider a more robust regex if needed
    // return { success: false, message: 'Invalid image URL.' };
    // For now, let's allow relative URLs too, or handle more robustly
  }


  try {
    // Check if the NEW username is already taken by ANOTHER user
    if (username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: username },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== userId) {
        return { success: false, message: 'Username is already taken.' };
      }
    }

    // Prepare data for update
    const updateData: { name: string; username: string; image?: string | null; password?: string } = {
        name: name,
        username: username,
        image: image, // Update image URL
    };

    // Hash password if provided
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile/edit');

    return { success: true };

  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}