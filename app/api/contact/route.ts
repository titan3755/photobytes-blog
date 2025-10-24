import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
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
      },
    });

    return NextResponse.json(
      { message: 'Message received successfully', data: contactMessage },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('API_CONTACT_ERROR', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}