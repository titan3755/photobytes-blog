'use server';

import { auth, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { verifyRecaptcha } from '@/lib/recaptcha';

// --- Order Creation ---
interface OrderResult {
  success: boolean;
  message?: string;
}

interface OrderData {
  category: string;
  description: string;
  budget: string | null;
  deadline: string | null;
  recaptchaToken: string;
}

export async function createOrder(data: OrderData): Promise<OrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'You must be logged in to place an order.' };
  }
  
  const { category, description, budget, deadline, recaptchaToken } = data;
  if (!recaptchaToken) {
    return { success: false, message: 'reCAPTCHA token is missing.' };
  }
  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) {
    return { success: false, message: 'reCAPTCHA verification failed. Are you a bot?' };
  }

  if (!category || !description) {
    return { success: false, message: 'Category and Description are required.' };
  }
  
  try {
    await prisma.order.create({
      data: {
        category,
        description,
        budget,
        deadline,
        status: 'PENDING',
        authorId: session.user.id,
      },
    });

    // Revalidate paths for admin and user's dashboard (for future use)
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true, message: 'Order submitted successfully!' };

  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}

// --- START: New Message Actions ---

/**
 * Fetches all messages for a specific order.
 * Security: Only the order author or an admin can access this.
 */
export async function getOrderMessages(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated.');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { authorId: true },
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  // Security check
  if (session.user.role !== Role.ADMIN && session.user.id !== order.authorId) {
    throw new Error('Not authorized to view these messages.');
  }

  // Fetch all messages, including the sender's details
  const messages = await prisma.message.findMany({
    where: { orderId: orderId },
    include: {
      sender: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

/**
 * Posts a new message to an order thread.
 * Security: Only the order author or an admin can post.
 */
export async function postMessage(
  orderId: string,
  content: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated.' };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, message: 'Message cannot be empty.' };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { authorId: true },
  });

  if (!order) {
    return { success: false, message: 'Order not found.' };
  }

  const isUserAdmin = session.user.role === Role.ADMIN;
  const isUserAuthor = session.user.id === order.authorId;

  // Security check
  if (!isUserAdmin && !isUserAuthor) {
    return { success: false, message: 'Not authorized to post here.' };
  }

  try {
    await prisma.message.create({
      data: {
        content: content.trim(),
        orderId: orderId,
        senderId: session.user.id,
        // Set read status based on sender
        isReadByAdmin: isUserAdmin,
        isReadByUser: isUserAuthor,
      },
    });

    // Revalidate paths to show new message
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error posting message:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}

/**
 * Marks messages in a thread as read by either user or admin.
 */
export async function markMessagesAsRead(
  orderId: string
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }
  
  const isUserAdmin = session.user.role === Role.ADMIN;

  try {
    if (isUserAdmin) {
      // Admin is reading, mark all messages as read by admin
      await prisma.message.updateMany({
        where: { orderId: orderId, isReadByAdmin: false },
        data: { isReadByAdmin: true },
      });
    } else {
      // User is reading, mark all messages as read by user
      await prisma.message.updateMany({
        where: { orderId: orderId, isReadByUser: false },
        data: { isReadByUser: true },
      });
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false };
  }
}

// --- END: New Message Actions ---

