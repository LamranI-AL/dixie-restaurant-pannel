/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/firebase/auth";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  restaurantName: z
    .string()
    .min(2, { message: "Restaurant name must be at least 2 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const { setUser } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      restaurantName: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // First create the restaurant
      const restaurantId =
        data.restaurantName.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Date.now();

      // Then create the user with the restaurant ID
      const user = await signUp(
        data.email,
        data.password,
        data.name,
        restaurantId,
      );
      // setUser(user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      if (error === "auth/email-already-in-use") {
        setError(
          "This email is already in use. Please try another email or log in.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-500 rounded-full p-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 12C7.88071 12 9 10.8807 9 9.5C9 8.11929 7.88071 7 6.5 7C5.11929 7 4 8.11929 4 9.5C4 10.8807 5.11929 12 6.5 12Z"
                  fill="white"
                />
                <path
                  d="M17.5 12C18.8807 12 20 10.8807 20 9.5C20 8.11929 18.8807 7 17.5 7C16.1193 7 15 8.11929 15 9.5C15 10.8807 16.1193 12 17.5 12Z"
                  fill="white"
                />
                <path
                  d="M21 16C21 14.3431 19.6569 13 18 13H14C12.3431 13 11 14.3431 11 16V19H21V16Z"
                  fill="white"
                />
                <path
                  d="M5 15.8C5 14.1198 6.3431 12.8 8 12.8H9C10.6569 12.8 12 14.1198 12 15.8V19H5V15.8Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Hungry Puppets
          </CardTitle>
          <CardDescription className="text-center">
            Create your restaurant admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              variant="destructive"
              className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tasty Delights"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
