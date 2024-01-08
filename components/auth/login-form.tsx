"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";


import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,  
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { LoginSchema } from "@/schema";
import { Button } from "../ui/button";
import { login } from "@/actions/login";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";


export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different provider!"
    : "";

    //set error and success message
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    // get isPending from useTransition
    const [isPending, startTransition] = useTransition();

    // define the form
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
          email: "",
          password: "",
        },
      });

    //   submit method will pass validated values thn check isPending state
    const onSubmit = (values: z.infer<typeof LoginSchema>) => {

      // clear all errors and sucess messages
      setError("");
      setSuccess("");

        startTransition(() => {
            login(values)
            .then((data) =>{
                setError(data?.error)
                setSuccess(data?.success)
            })
        })
    }

    return (
       
            <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
            >

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            >
            <div className="space-y-4">

                {/* email input */}
            <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                           disabled={isPending}
                          placeholder="john.doe@example.com"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password input */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type="password"
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="px-0 font-normal"
                      >
                        <Link href="/auth/reset">
                          Forgot password?
                        </Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormError message={error || urlError} />
          <FormSuccess message={success} />
          
            {/* Login Button */}
            <Button
             disabled={isPending}
            type="submit"
            className="w-full"
          >
            Login
          </Button>
            </form>
            
            </Form>
            </CardWrapper>
       
    )
}