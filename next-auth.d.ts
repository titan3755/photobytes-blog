import type { Role } from '@prisma/client';
import NextAuth, { type DefaultSession, type User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: Role;
      /** The user's username. */
      username: string | null;
      /** The user's ID. */
      id: string;
    } & DefaultSession['user'];
  }

  // Also augment the User type
  interface User {
    role: Role;
    username: string | null;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    /** The user's role */
    role: Role;
    /** The user's username */
    username: string | null;
    /** The user's ID */
    id: string;
  }
}