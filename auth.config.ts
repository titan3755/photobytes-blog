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
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On sign-in, 'user' object is available
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    // This callback adds the role to the session object
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as Role; // Add role to session
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === 'ADMIN';
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