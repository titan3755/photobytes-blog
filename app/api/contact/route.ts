import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'Unknown';
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
    const body = await request.json();
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
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
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}