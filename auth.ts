import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';
import { NextResponse } from 'next/server'; // Import NextResponse here

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers, // Google and Facebook
    CredentialsProvider({
      // ... (your existing CredentialsProvider config)
      async authorize(credentials) {
        // ... (your existing authorize logic)
        const { email, username, password } = credentials;

        // --- FIX: Add type guard ---
        if (typeof password !== 'string') {
          return null; // or throw an error
        }
        // --- END FIX ---

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              email ? { email: email as string } : undefined,
              username ? { username: username as string } : undefined,
            ].filter(Boolean) as any,
          },
        });
        if (!user || typeof user.password !== 'string') {
          return null;
        }
        const valid = await bcrypt.compare(password, user.password); // Error is now fixed
        if (!valid) return null;
        return user; // Return the full user object
      },
    }),
  ],
  // --- All callbacks are now in this file ---
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, the 'user' object is available.
      // For subsequent requests, we fetch from the DB to ensure role is fresh.
      if (user?.id) {
        // This is a sign-in event.
        token.id = user.id;
        // @ts-ignore - 'user' object has role from authorize or adapter
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
      } else if (token.id) {
        // This is a subsequent request. Re-fetch user to ensure role is up-to-date.
        // This is crucial for when an admin changes a user's role.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;

      // 'auth' is the session object (thanks to our session callback)
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isAdmin = userRole === 'ADMIN';
      const isBlogger = userRole === 'BLOGGER';

      // 1. Handle public pages that logged-in users shouldn't see
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
          return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      // 2. Handle /forbidden page
      if (pathname.startsWith('/forbidden')) {
        return true;
      }

      // 3. Protect /admin routes
      if (pathname.startsWith('/admin')) {
        if (isLoggedIn) {
          return isAdmin; // Only admin can access
        }
        return false; // Not logged in
      }

      // 4. Protect /dashboard/articles
      if (pathname.startsWith('/dashboard/articles')) {
        if (isLoggedIn) {
          return isAdmin || isBlogger; // Admin or Blogger
        }
        return false; // Not logged in
      }

      // 5. Protect /dashboard (main) and /profile routes
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile')
      ) {
        return isLoggedIn; // Any logged-in user
      }

      // 6. Allow all other routes
      return true;
    },
  },
});
