import type { Role } from '@prisma/client';
import NextAuth, { type DefaultSession, type User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role;
      username: string | null;
      id: string;
      createdAt?: Date | string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    username: string | null;
    createdAt?: Date | string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    username: string | null;
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    createdAt?: Date | string | null;
  }
}