import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // session: { strategy: "jwt" }, // This was correctly removed
  providers: [
    ...authConfig.providers, // Google and Facebook
    CredentialsProvider({
      async authorize(credentials) {
        // ... (your authorize logic remains the same)
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
    // --- START FIX: Changed if(user) to if(user?.id) ---
    async jwt({ token, user }) {
      noStore(); 
      // Check for user AND user.id
      if (user?.id) { // 'user' is only available on sign-in and has a defined id
        token.id = user.id; // Now this is type-safe
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
        // @ts-ignore
        token.canComment = user.canComment;
        // @ts-ignore
        token.createdAt = user.createdAt;
      }

      if (token.id) {
         const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            username: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            canComment: true,
      },
        });
         if (dbUser) {
          // Update the token with the fresh data
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.createdAt = dbUser.createdAt;
          token.canComment = dbUser.canComment;
        }
      }
      
      return token;
    },
    // --- END FIX ---
    
    // Session callback is now the main source of truth for the session object
    // It receives the 'user' object from the database session
    async session({ session, user, token }) {
      if (user && session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.username = user.username;
        session.user.canComment = user.canComment;
        session.user.createdAt = user.createdAt;
        // name, email, and image are already handled by default
      } else if (token && session.user) {
         // Fallback for cases where token is still used (less common with db strategy)
         session.user.id = token.id as string;
         session.user.role = token.role as Role;
         session.user.username = token.username as string | null;
         session.user.canComment = token.canComment as boolean;
         session.user.createdAt = token.createdAt as Date | string | null;
      }
      return session;
    },

    // Authorized callback now correctly receives the session from the DB
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
      
      // Protect /admin AND /dev routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/dev')) {
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