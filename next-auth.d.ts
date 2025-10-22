import type { Role } from '@prisma/client';
import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: Role;
    } & DefaultSession['user'];
  }

  // Add this interface
  /**
   * The shape of the `user` object returned from the `authorize` callback
   * or the adapter.
   */
  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    /** The user's role */
    role: Role;
  }
}