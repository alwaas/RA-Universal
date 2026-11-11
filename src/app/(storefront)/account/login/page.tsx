"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account/profile";
  const errorParam = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getNoticeMessage = () => {
    if (errorParam === "expired") {
      return "Your session has expired. Please sign in again to continue.";
    }
    if (errorParam === "unauthorized") {
      return "Please sign in with your customer account to access this page.";
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Authentication successful. Redirecting to your account...");
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 500);
      } else {
        setErrorMessage(
          data.error?.message || "Invalid phone number/email or password."
        );
      }
    } catch {
      setErrorMessage("Network connection failure. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const notice = getNoticeMessage();

  return (
    <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Welcome Back
        </h1>
        <p className="text-xs text-neutral-500">
          Sign in to access your saved profile and order tracking
        </p>
      </div>

      {notice && !errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-[8px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-[8px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-[8px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Phone Number or Email"
          required
          placeholder="e.g. 7388553867 or user@example.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-neutral-600 border-t border-neutral-100 pt-4">
        Don&apos;t have an account?{" "}
        <Link
          href={`/account/signup${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="font-semibold text-brand-primary hover:underline"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <Suspense fallback={<div className="h-64 bg-white rounded animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
