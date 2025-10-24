import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Import auth to get the session
import { Role } from '@prisma/client'; // Import Role

export async function POST(request: Request) {
  try {
    // 1. Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Optional: Prevent Admins/Bloggers from applying again
    if (session.user.role === Role.ADMIN || session.user.role === Role.BLOGGER) {
         return NextResponse.json(
            { message: 'You already have blogger privileges.' },
            { status: 400 }
         );
    }

    // 2. Check if user already has an application
    const existingApplication = await prisma.bloggerApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      // Respond differently based on status if needed
      let message = 'You have already submitted an application.';
      if (existingApplication.status === 'PENDING') {
        message = 'Your application is currently pending review.';
      } else if (existingApplication.status === 'APPROVED') {
        message = 'Your application was already approved.';
      } else if (existingApplication.status === 'REJECTED') {
          message = 'Your previous application was reviewed. Please contact support if you wish to reapply.';
      }
      return NextResponse.json({ message }, { status: 409 }); // 409 Conflict
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { reason, topics, sampleUrl } = body;

    if (!reason || !topics) {
      return NextResponse.json(
        { message: 'Missing required fields: reason and topics' },
        { status: 400 }
      );
    }

    // 4. Create the application in the database
    const newApplication = await prisma.bloggerApplication.create({
      data: {
        userId: session.user.id,
        reason,
        topics,
        sampleUrl: sampleUrl || null, // Ensure optional field is null if empty
        // Status defaults to PENDING
      },
    });

    // 5. Return success response
    return NextResponse.json(
      { message: 'Application submitted successfully', data: newApplication },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('API_APPLY_ERROR', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
