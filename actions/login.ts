"use server";

import { signIn } from "@/auth";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
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
  const { email, password, code } = validatedFields.data;

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
  
  //2FA

  //Verify 2FA code
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(
        existingUser.email
      );

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }
      //chcks if user provided token is same as stored token
      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }
      // check if token has expired
      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }
    // delte token when it has been verified
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      // create new confirmation code
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        }
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token,
      );
    
    return {twoFactor: true}
     }
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
