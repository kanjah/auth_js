import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}
/* 
* used for hot reload, thats why we use globalThis in production mode
* and new PrismaClient in development
* globalThis is not affected by hot reload
*/
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;