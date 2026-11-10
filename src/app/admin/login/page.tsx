"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";
  const errorParam = searchParams.get("error");

  const [phone, setPhone] = useState("9999999999");
  const [password, setPassword] = useState("SuperSecureAdminPassword2026!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getNoticeMessage = () => {
    if (errorParam === "forbidden") {
      return "Access Denied. Your account does not have administrative permissions.";
    }
    if (errorParam === "expired") {
      return "Your administrative session has expired. Please sign in again.";
    }
    if (errorParam === "unauthorized") {
      return "Administrative authentication required to access the admin portal.";
    }
    return null;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.data?.user?.role !== "admin") {
          setErrorMessage(
            "Access Denied. This account is registered as a customer and lacks administrator privileges."
          );
          setIsLoading(false);
          return;
        }

        setSuccessMessage("Admin authentication verified. Entering portal...");
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 500);
      } else {
        setErrorMessage(
          data.error?.message || "Invalid administrative credentials."
        );
      }
    } catch {
      setErrorMessage("Network error connecting to administrative authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  const notice = getNoticeMessage();

  return (
    <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-neutral-900 text-accent-gold rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Admin Portal Login
        </h1>
        <p className="text-xs text-neutral-500">
          Secure administrative control for catalogue and inventory
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

      <form onSubmit={handleAdminLogin} className="space-y-4">
        <Input
          label="Admin Registered Phone or Email"
          required
          placeholder="e.g. 9999999999 or admin@rauniversal.in"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="Admin Password"
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
          Enter Admin Dashboard
        </Button>
      </form>

      <div className="p-3.5 bg-brand-secondary border border-neutral-200 rounded-[8px] text-xs text-neutral-700 space-y-1">
        <p className="font-bold text-neutral-900">Demo Administrative Credentials:</p>
        <p>
          Identifier: <span className="font-mono font-semibold text-neutral-900">9999999999</span> (or <span className="font-mono font-semibold text-neutral-900">admin@rauniversal.in</span>)
        </p>
        <p>
          Password: <span className="font-mono font-semibold text-neutral-900">SuperSecureAdminPassword2026!</span>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto py-16 sm:py-24 px-4">
      <Suspense fallback={<div className="h-64 bg-white rounded animate-pulse" />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
