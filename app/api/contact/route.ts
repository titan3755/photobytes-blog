import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { verifyRecaptcha } from '@/lib/recaptcha'; // 1. Import reCAPTCHA helper

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const body = await request.json();
    // 2. Extract all fields from the body, including the token
    const { name, email, message, recaptchaToken } = body;

    // --- START: reCAPTCHA Verification ---
    // 3. Verify the reCAPTCHA token first
    if (!recaptchaToken) {
      return NextResponse.json(
        { message: 'reCAPTCHA token is missing.' },
        { status: 400 }
      );
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed. Are you a bot?' },
        { status: 403 }
      );
    }
    // --- END: reCAPTCHA Verification ---

    // 4. Get user's IP (for your existing rate limit)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'Unknown';

    // 5. Run your IP-based rate limit (only for non-admins)
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

    // 6. Validate required fields
    const finalName = name || session?.user?.name || '';
    const finalEmail = email || session?.user?.email || '';
    if (!finalName || !finalEmail || !message) {
      return NextResponse.json(
        { message: 'Missing required fields (Name, Email, Message)' },
        { status: 400 }
      );
    }

    // 7. Create the contact message
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
      return NextResponse.json(
        { message: 'Database error occurred.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}