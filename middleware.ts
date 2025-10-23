import NextAuth from 'next-auth';
import { auth } from './auth';
export const runtime = 'nodejs';
export default auth;
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|final.svg).*)',
  ],
};

