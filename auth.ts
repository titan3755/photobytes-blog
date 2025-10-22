import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
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