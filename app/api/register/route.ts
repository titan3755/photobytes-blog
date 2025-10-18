import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * Handles the POST request for user registration.
 * @param request - The incoming request object.
 * @returns A response indicating success or failure.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // 1. Validate input
    if (!email || !username || !password) {
      return new NextResponse("Missing email, username, or password", { status: 400 });
    }

    // 2. Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUserByEmail) {
      return new NextResponse("User with this email already exists", { status: 409 });
    }

    const existingUserByUsername = await prisma.user.findUnique({
        where: { username: username },
    });
    if (existingUserByUsername) {
        return new NextResponse("User with this username already exists", { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}