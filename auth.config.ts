import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { NextResponse } from 'next/server';
import type { Role } from '@prisma/client';

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // This callback adds the role, id, and username to the JWT token
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
      }
      return token;
    },
    // This callback adds the role, id, and username to the session object
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as Role;
        }
        if (token.username) {
          session.user.username = token.username as string;
        }
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;

      const isLoggedIn = !!auth;

      // @ts-ignore
      const userRole = auth?.role;
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
          if (isAdmin) {
            return true;
          } else {
            return NextResponse.redirect(new URL('/forbidden', nextUrl));
          }
        }
        return false;
      }

      // 4. Protect /dashboard/articles
      if (pathname.startsWith('/dashboard/articles')) {
        if (isLoggedIn) {
          if (isAdmin || isBlogger) {
            return true;
          } else {
            return NextResponse.redirect(new URL('/forbidden', nextUrl));
          }
        }
        return false;
      }

      // 5. Protect /dashboard (main) and /profile routes
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile')
      ) {
        if (isLoggedIn) return true;
        return false;
      }

      // 6. Allow all other routes
      return true;
    },
  },
} satisfies NextAuthConfig;