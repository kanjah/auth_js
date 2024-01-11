/*
 * next-auth documentation: https://authjs.dev/guides/upgrade-to-v5
 * since we are using prisma for database, prisma dnt support edge, which will run the middleware
 * so we created auth.config.ts to run the middleware and auth.js to run prisma for sign in and use db session
 * * NB: sub is the id of the user
 */

import NextAuth from "next-auth"
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";


export const {
  handlers: { GET, POST },
  //   authenticated users
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // for email verification for both githbub and google and email
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  // callbacks
  callbacks: {
    // for email & 2FA verification
    async signIn({ user, account }) {
      console.log({user, account});

      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

       if (existingUser.isTwoFactorEnabled) {
         const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

         if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
         await db.twoFactorConfirmation.delete({
           where: { id: twoFactorConfirmation.id }
         });
       }

      return true;
    },
    
    async session({ token, session }) {
      console.log({sessionToken: token})
       if (token.sub && session.user) {
         session.user.id = token.sub;
       }

       if (token.role && session.user) {
         session.user.role = token.role as UserRole;
       }

      // if (session.user) {
      //   session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      // }

      // if (session.user) {
      //   session.user.name = token.name;
      //   session.user.email = token.email;
      //   session.user.isOAuth = token.isOAuth as boolean;
      // }

      return session;
    },
    async jwt({ token }) {
       if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

       if (!existingUser) return token;

      // const existingAccount = await getAccountByUserId(
      //   existingUser.id
      // );

      // token.isOAuth = !!existingAccount;
      // token.name = existingUser.name;
      // token.email = existingUser.email;
       token.role = existingUser.role;
      // token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      //console.log({token})
      console.log({sessionToken:token})
      return token;
    }
     
    
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
