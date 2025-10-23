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
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile')
      ) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;