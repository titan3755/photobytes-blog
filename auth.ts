import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { Role, User } from '@prisma/client'; // Import User type
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
    // --- START: MODIFIED JWT CALLBACK WITH SESSIONVERSION ---
    async jwt({ token, user, trigger }) {
      noStore(); 
      
      // a) On initial sign-in
      if (user?.id) {
        const dbUser = user as User; // Cast to full User
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.username = dbUser.username;
        token.canComment = dbUser.canComment;
        token.createdAt = dbUser.createdAt;
        token.sessionVersion = dbUser.sessionVersion; // <-- Add session version
      }

      // b) On *manual* update (from SessionRefresher), force re-fetch
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
         where: { id: token.id as string },
         select: { role: true, username: true, name: true, email: true, image: true, createdAt: true, canComment: true, sessionVersion: true },
       });
        if (dbUser) {
         token.role = dbUser.role;
         token.username = dbUser.username;
         token.name = dbUser.name;
         token.email = dbUser.email;
         token.picture = dbUser.image;
         token.createdAt = dbUser.createdAt;
         token.canComment = dbUser.canComment;
         token.sessionVersion = dbUser.sessionVersion; // <-- Update version
       }
     }

      // c) On *every other* session check, do a *cheap* query
      if (token.id) {
        const dbSessionVersion = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true }
        });
        
        // @ts-ignore
        if (dbSessionVersion && dbSessionVersion.sessionVersion !== token.sessionVersion) {
          console.log("Stale sessionVersion detected, re-fetching user data.");
          // If versions mismatch, re-fetch all data
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
              sessionVersion: true, // <-- Add session version
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.createdAt = dbUser.createdAt;
            token.canComment = dbUser.canComment;
            token.sessionVersion = dbUser.sessionVersion; // <-- Update version
          }
        }
      }
      
      return token;
    },
    // --- END: MODIFIED JWT CALLBACK ---
    
    async session({ session, user, token }) {
      if (user && session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.username = user.username;
        session.user.canComment = user.canComment;
        session.user.createdAt = user.createdAt;
      } else if (token && session.user) {
        // This is the one that will be used with JWT strategy
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string | null;
        session.user.canComment = token.canComment as boolean;
        session.user.createdAt = token.createdAt as Date | string | null;
      }
      return session;
    },

    // Authorized callback (middleware)
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;
      
      // --- FIX: In v5, `auth.user` is for database strategy. ---
      // --- Middleware must read from `auth` (if JWT) or `auth.token` ---
      const isLoggedIn = !!auth; 
      // @ts-ignore
      const userRole = auth?.token?.role || auth?.user?.role; // Read from token first, fallback to user
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
        pathname.startsWith('/profile') ||
        pathname.startsWith('/order') // --- FIX: Added /order to protected routes ---
      ) {
        if (!isLoggedIn) return false;
        return true;
      }
      return true;
    },
  },
});