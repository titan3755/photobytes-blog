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
      if (user?.id) {
        // Initial sign-in
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
        token.name = user.name; // <-- Ensure name is added
        token.email = user.email; // <-- Ensure email is added
      } else if (token.id) {
        // Subsequent requests - refresh role (and potentially name/email)
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.name = dbUser.name; // <-- Refresh name
          token.email = dbUser.email; // <-- Refresh email
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add all properties from token to session
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as Role;
        if (token.username) session.user.username = token.username as string;
        if (token.name) session.user.name = token.name; // <-- Ensure name is added
        if (token.email) session.user.email = token.email; // <-- Ensure email is added
      }
      return session;
    },
    // Authorized callback remains the same as your correct version
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isAdmin = userRole === 'ADMIN';
      const isBlogger = userRole === 'BLOGGER';

      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
          return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }
      if (pathname.startsWith('/forbidden')) return true;
      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        if (!isAdmin)
          return NextResponse.redirect(new URL('/forbidden', nextUrl));
        return true;
      }
      if (pathname.startsWith('/dashboard/articles')) {
        if (!isLoggedIn) return false;
        if (!isAdmin && !isBlogger)
          return NextResponse.redirect(new URL('/forbidden', nextUrl));
        return true;
      }
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile')
      ) {
        if (!isLoggedIn) return false;
        return true;
      }
      return true;
    },
  },
});
