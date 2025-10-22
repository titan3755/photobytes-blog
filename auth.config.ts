import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
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
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const pathname = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === 'ADMIN';
      if (pathname.startsWith('/admin')) {
        return isLoggedIn && isAdmin;
      }
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile')
      ) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;