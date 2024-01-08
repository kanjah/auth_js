"use server";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schema";
import { AuthError } from "next-auth";
import * as z from "zod";



export const login = async (values: z.infer<typeof LoginSchema>) => {
    // validate the form fields
    const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { email, password } = validatedFields.data;

  // check for existing user
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" }
  }

  //check if user is verified
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );
    // send verification email
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

      return { success: "Confirmation email sent"};
  }

  try{
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT
    })
  }
  catch(error){
     if(error instanceof AuthError){
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
          default:
            return { error: "something wnt wrong" };
      }
     }
     throw error;
  }
}
