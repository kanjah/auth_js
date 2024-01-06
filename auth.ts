/*
 * next-auth documentation: https://authjs.dev/guides/upgrade-to-v5
 * since we are using prisma for database, prisma dnt support edge, which will run the middleware
 * so we created auth.config.ts to run the middleware and auth.js to run prisma for sign in and use db session
 * * NB: sub is the id of the user
 */

import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";



export const {
  handlers: { GET, POST },
  //   authenticated users
  auth,
  signIn,
  signOut
} = NextAuth({
  callbacks: {
    
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
