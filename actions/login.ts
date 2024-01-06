"use server";

import { signIn } from "@/auth";
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
