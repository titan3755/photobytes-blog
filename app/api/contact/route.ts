import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // 1. Import the auth function

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'Unknown';

    if (!isAdmin) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentMessage = await prisma.contactMessage.findFirst({
        where: {
          ...(ip !== 'Unknown' && { ipAddress: ip }),
          createdAt: {
            gte: oneHourAgo,
          },
        },
        select: { id: true },
      });

      if (ip !== 'Unknown' && recentMessage) {
        return NextResponse.json(
          { message: 'You can only submit one message per hour.' },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { name, email, message } = body;
    const finalName = name || session?.user?.name || '';
    const finalEmail = email || session?.user?.email || '';
    if (!finalName || !finalEmail || !message) {
      return NextResponse.json(
        { message: 'Missing required fields (Name, Email, Message)' },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: finalName,
        email: finalEmail,
        message,
        ipAddress: ip,
      },
    });

    return NextResponse.json(
      { message: 'Message received successfully', data: contactMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error('API_CONTACT_ERROR', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
       return NextResponse.json({ message: 'Database error occurred.' }, { status: 500 });
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}