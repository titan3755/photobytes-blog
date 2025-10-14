import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const { handlers: { GET, POST }, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
      if (
      !credentials ||
      (typeof credentials.password !== "string") ||
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
      if (!user || typeof user.password !== "string") {
        return null;
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;
      return user;
  },
})
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
