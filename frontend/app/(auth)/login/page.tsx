"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "@/api-services/hooks/useAuth";
import Link from "next/link";
import { Route } from "next";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutate, isPending } = useLogin();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3 z-99">
        <h1 className="text-2xl lg:text-3xl uppercase font-bold lg:font-semibold tracking-tight text-black-500 ">
          Welcome Back
        </h1>
        <p className="max-w-sm text-sm leading-6 text-stone-600">
          Sign in to keep inventory, orders, and team workflows moving.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        method="post"
        noValidate
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Enter your email"
            className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-200 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 pr-28 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-200 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-2 my-auto px-3 text-xs font-semibold text-stone-700 hover:text-stone-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(37,99,235,0.75)] transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {isPending ? "Signing in..." : "Log in"}
        </button>
      </form>

      <div className="flex flex-col text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
      <Link
        href={"/forgot-password" as Route}
        className="text-center text-sm font-semibold text-brand-700 hover:underline flex justify-center items-center"
      >
        Forgot Password?
      </Link>
    </div>
  );
}
