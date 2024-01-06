"use server";

import {  RegisterSchema } from "@/schema";
import * as z from "zod";



export const register = async (values: z.infer<typeof RegisterSchema>) => {
    // validate the form fields
    const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  return {success: "Email sent!"}
}
