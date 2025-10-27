'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface OrderResult {
  success: boolean;
  message?: string;
}

interface OrderData {
  category: string;
  description: string;
  budget: string | null;
  deadline: string | null;
}

export async function createOrder(data: OrderData): Promise<OrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'You must be logged in to place an order.' };
  }
  
  const { category, description, budget, deadline } = data;

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
