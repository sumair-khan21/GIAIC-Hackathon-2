"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema, SigninFormData } from "@/lib/validations";
import { signIn } from "@/lib/auth";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SigninPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-slate-900 to-fuchsia-600/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-[100px]"
        />

        <div className="relative z-10 text-center space-y-6 max-w-lg px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white"
          >
            Master Your Productivity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            Join thousands of users who are organizing their life and work with TaskFlow. Simple, powerful, beautiful.
          </motion.p>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-slate-500">Sign in to continue your journey</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    {...register("email")}
                    type="email"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300",
                      errors.email && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    )}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                  <Link href="#" className="text-xs font-medium text-violet-600 hover:text-violet-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    {...register("password")}
                    type="password"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300",
                      errors.password && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    )}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.form>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-violet-600 font-semibold hover:text-violet-500 hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
