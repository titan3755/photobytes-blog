// auth.ts

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config'; // 1. Import the light config

// 2. Import the heavy providers here
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // 3. Spread the light config (pages, session, Google, Facebook)
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers, // 4. Include providers from the light config
    // 5. Add the heavy CredentialsProvider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.password !== 'string' ||
          (!credentials.email && !credentials.username)
        ) {
          return null;
        }
        const { email, username, password } = credentials;
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
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return user;
      },
    }),
  ],
});