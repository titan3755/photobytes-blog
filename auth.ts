import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers, // Google and Facebook
    CredentialsProvider({
      // ... (CredentialsProvider config remains the same)
      async authorize(credentials) {
        const { email, username, password } = credentials;
        if (typeof password !== 'string') return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              email ? { email: email as string } : undefined,
              username ? { username: username as string } : undefined,
            ].filter(Boolean) as any,
          },
        });
        if (!user || typeof user.password !== 'string') return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        // Initial sign-in
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // Add image as picture
        // @ts-ignore - Add createdAt
        token.createdAt = user.createdAt;
      } else if (token.id) {
        // Subsequent requests - refresh data
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image; // Refresh image
          token.createdAt = dbUser.createdAt;
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
        // name, email, image are typically handled by DefaultSession,
        // but explicitly setting them ensures they are present
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture; // Map picture back to image
        if (token.createdAt) session.user.createdAt = token.createdAt;
      }
      return session;
    },
    // Authorized callback remains the same
    authorized({ auth, request }) {
        // ... your existing authorized logic ...
        const { nextUrl } = request;
        const pathname = nextUrl.pathname;
        const isLoggedIn = !!auth?.user; // Check user object in session
        const userRole = auth?.user?.role; // Get role from session user
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