import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, username, password, recaptchaToken } = body;

    // 2. Verify the reCAPTCHA token first
    if (!recaptchaToken) {
      return NextResponse.json({ message: 'reCAPTCHA token is missing.' }, { status: 400 });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ message: 'reCAPTCHA verification failed. Are you a bot?' }, { status: 403 });
    }

    // 3. Validate required fields
    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Email, username, and password are required.' }, { status: 400 });
    }

    // 4. Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email or username already exists.' }, { status: 409 });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create the user
    await prisma.user.create({
      data: {
        name: name || null, // Handle optional name
        email,
        username,
        password: hashedPassword,
        role: Role.USER, // Default role
      },
    });

    // Don't return the user object, just a success message
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
