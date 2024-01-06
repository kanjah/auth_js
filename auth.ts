/*
 * next-auth documentation: https://authjs.dev/guides/upgrade-to-v5
 * since we are using prisma for database, prisma dnt support edge, which will run the middleware
 * so we created auth.config.ts to run the middleware and auth.js to run prisma for sign in and use db session
 */

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const {
  handlers: { GET, POST },
  //   authenticated users
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
