"use client";

import { useRegister } from "@/api-services/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function SignupPage() {
  const { mutate, isPending } = useRegister();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email, and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    mutate(
      { name: fullName, email, password },
      {
        onSuccess: () => {
          router.push("/login");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3 z-99">
       
        <h1 className="text-2xl lg:text-3xl uppercase lg:font-semibold font-bold tracking-tight text-stone-900">
          Get started
        </h1>
        <p className="max-w-sm text-sm leading-6 text-stone-600">
          Create a ForgeTrack account to manage engineering inventory with your team.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-stone-700"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Enter your full name"
            className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-200 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

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
              autoComplete="new-password"
              placeholder="Create a password"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 pr-28 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-200 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-2 my-auto  px-3 text-xs font-semibold text-stone-700 hover:text-stone-900"
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
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>


      <p className="text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
