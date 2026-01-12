"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/lib/validations";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0], // Use email prefix as name
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-muted">Sign up to start managing your tasks</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                id="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:text-primary-dark font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
