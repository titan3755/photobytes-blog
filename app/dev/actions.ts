'use server';

import { auth } from '@/auth'; // Check auth
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * A simple test action that only Admins can run.
 */
export async function testDevAction(formData: FormData) {
  const session = await auth();
  const message = formData.get('message') as string;

  // Secure the action to Admins
  if (session?.user?.role !== Role.ADMIN) {
    return { success: false, message: 'Unauthorized: Requires ADMIN role.' };
  }

  if (!message || message.trim().length === 0) {
    return { success: false, message: 'Message cannot be empty.' };
  }

  // Simulate a database call or long-running task
  console.log(`Test action received from Admin: ${message}`);
  await new Promise((res) => setTimeout(res, 1000));

  revalidatePath('/dev'); // Revalidate the dev page
  return {
    success: true,
    message: `Server received your test message: "${message}"`,
  };
}
