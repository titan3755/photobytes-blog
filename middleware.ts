// middleware.ts

import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Import the new lightweight config

// Initialize NextAuth with the lightweight config
const { auth } = NextAuth(authConfig);

// Export auth as middleware
export default auth;

// Your matcher config remains the same
export const config = {
  matcher: ['/dashboard(.*)', '/profile(.*)'],
};