"use server";
import bcrypt from "bcryptjs";
import {  RegisterSchema } from "@/schema";
import * as z from "zod";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";



export const register = async (values: z.infer<typeof RegisterSchema>) => {
    // validate the form fields
    const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  // hash the password
  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // check for existing user
  const existingUser = await getUserByEmail(email);
  //const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // verify the token using generationToken in data/verification-token
const verificationToken = await generateVerificationToken(email);

  //send verification token email
  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
  );
  return {success: "Confirmation email sent!"}
};
