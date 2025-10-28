import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const application = await prisma.bloggerApplication.findUnique({
      where: { userId: session.user.id },
      select: { status: true }, // Only fetch the status
    });

    if (!application) {
      // It's not an error if they haven't applied yet
      return NextResponse.json({ status: null }, { status: 404 });
    }

    return NextResponse.json({ status: application.status }, { status: 200 });

  } catch (error) {
    console.error('API_APPLY_STATUS_ERROR', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
