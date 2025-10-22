import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * Handles the POST request for user registration.
 * @param request
 * @returns
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, name } = body;
    if (!email || !username || !password) {
      return new NextResponse('Missing email, username, or password', {
        status: 400,
      });
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return new NextResponse('User with this email already exists', {
          status: 409,
        });
      }
      return new NextResponse('User with this username already exists', {
        status: 409,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}