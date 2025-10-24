import type { Role } from '@prisma/client';
import NextAuth, { type DefaultSession, type User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role;
      username: string | null;
      id: string;
      // name, email, image are part of DefaultSession
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    username: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    username: string | null;
    id: string;
    name?: string | null; // Make sure name is here
    email?: string | null;
    // picture corresponds to image
  }
}