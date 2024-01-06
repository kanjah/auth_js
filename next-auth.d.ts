import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";


export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
   isTwoFactorEnabled: boolean;
   isOAuth: boolean;
};

/* 
*implenting session.user.role in auth.js, 
* documentation:https://authjs.dev/getting-started/typescript#module-augmentation
*/

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}