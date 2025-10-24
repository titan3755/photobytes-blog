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
    // Destructure name (it might be undefined if not sent)
    const { email, username, password, name } = body;

    // Only email, username, and password are strictly required from input
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
      // If not email, it must be username
      return new NextResponse('User with this username already exists', {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Start: Logic for Name Fallback ---
    // Use the provided name if it's not empty, otherwise use the username
    const finalName = name && name.trim().length > 0 ? name.trim() : username;
    // --- End: Logic for Name Fallback ---

    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: finalName, // Use the finalName determined above
        password: hashedPassword,
        // Role defaults to USER via schema
      },
    });

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}